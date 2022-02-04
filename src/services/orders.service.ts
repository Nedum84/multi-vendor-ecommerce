import { Request } from "express";
import sequelize, { SubOrders, Orders, OrdersPayment } from "../models";
import { Op, Transaction } from "sequelize/dist";
import { FundingTypes, PaymentChannel, PaymentStatus } from "../enum/payment.enum";
import { DeliveryStatus, OrderStatus } from "../enum/orders.enum";
import moment from "moment";
import CONSTANTS from "../utils/constants";
import userWalletService from "./user.wallet.service";
import cartService from "./cart.service";
import couponService from "./coupon.service";
import { CouponInstance } from "../models/coupon.model";
import { ErrorResponse } from "../apiresponse/error.response";
import shippingService from "./shipping.service";
import { genUniqueColId } from "../utils/random.string";
import { asyncForEach } from "../utils/function.utils";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { Helpers } from "../utils/helpers";
import { OrdersInstance } from "../models/orders.model";
import { NotFoundError } from "../apiresponse/not.found.error";
import { isAdmin } from "../utils/admin.utils";
import storeService from "./store.service";
import vendorSettlementService from "./vendor.settlement.service";
import userAddressService from "./user.address.service";
import orderAddressService from "./order.address.service";
import subOrdersService from "./sub.orders.service";
import productVariationService from "./product.variation.service";
import { VendorSettlementInstance } from "../models/vendor.settlement.model";

//create
const create = async (req: Request) => {
  const { user_id } = req.user!;
  const { coupon_code, address_id }: { coupon_code: string; address_id: string } = req.body;

  const userCarts = await cartService.findAllByUserId(user_id);
  const carts = userCarts.carts;

  // -->check product qty avaialability
  if (!productVariationService.validateCartProductQty(carts)) {
    throw new ErrorResponse("One or more Item is currently out of stock");
  }

  let couponData: { coupon_amount: number; sub_total: number; coupon: CouponInstance } | undefined;
  if (coupon_code) {
    couponData = await couponService.applyCoupon(user_id, coupon_code);
  }

  const coupon_amount = couponData ? couponData.coupon_amount : 0;
  const overall_tax_amount = 0;
  const overall_shipping_amount = await shippingService.getTotalShipping(carts, address_id);
  const overall_amount = userCarts.sub_total - coupon_amount + overall_shipping_amount + overall_tax_amount;
  // {{ amount = sub_total - coupon_amount + shipping_amount + tax_amount }}

  const order_id = await genUniqueColId(Orders, "order_id", 12, "numeric", "uppercase");

  //Transaction starts...
  const result = await sequelize.transaction(async (transaction) => {
    const order = await Orders.create(
      {
        order_id,
        amount: overall_amount,
        sub_total: userCarts.sub_total,
        coupon_code,
        coupon_amount,
        shipping_amount: overall_shipping_amount,
        tax_amount: overall_tax_amount,
        purchased_by: user_id,
      },
      { transaction }
    );

    const cartStoreIds = carts.map((x) => x.store_id);
    const uniqueStores = Array.from(new Set(cartStoreIds));
    //Iterate each store
    await asyncForEach(uniqueStores, async (store_id) => {
      //Create Sub Order...
      await subOrdersService.create(order_id, store_id, user_id, address_id, carts, transaction, couponData);
    });

    //Create order address
    const userAddress = await userAddressService.findById(address_id);
    await orderAddressService.create(userAddress, order_id, transaction);
    //clear the cart
    await cartService.clearCart(user_id, undefined, transaction);
    //Update product variation qty(Minus the bought qty from the total)
    await productVariationService.updateQtyRemaining(carts, transaction);
    //get all orders
    const sub_orders = await subOrdersService.findAllByOrderId(order_id, transaction);
    // await transaction.commit(); //not needed since this is sequelize managed transaction
    return { order, sub_orders };
  }); //Transaction ends...

  return result;
};

//update
const updatePayment = async (req: Request) => {
  const { user_id } = req.user!;
  const { order_id } = req.params;

  const {
    payment_status,
    payment_id,
    payed_from_wallet,
    payment_channel,
  }: {
    payment_status: PaymentStatus;
    payment_channel: PaymentChannel;
    payment_id: string;
    payed_from_wallet: boolean;
  } = req.body;

  let order: OrdersInstance | null;
  const subOrder = await SubOrders.findOne({ where: { sub_order_id: order_id } });
  if (subOrder) {
    order = await Orders.findOne({ where: { order_id: subOrder.order_id } });
  } else {
    order = await Orders.findOne({ where: { order_id: order_id } });
  }

  if (!order) {
    throw new ErrorResponse("Order not found");
  }

  if (order.purchased_by !== user_id) {
    throw new UnauthorizedError();
  }

  if (order.sub_orders.find((o) => o.order_status == OrderStatus.CANCELLED)) {
    throw new ErrorResponse("Order already cancelled");
  }

  if (order.payment.payment_status == PaymentStatus.COMPLETED) {
    throw new ErrorResponse("This order is already payed for");
  }

  if (payed_from_wallet) {
    const balance = await userWalletService.getWalletBalance(user_id);
    if (balance < order.amount) {
      throw new ErrorResponse("Insufficient balance to purchase the order from wallet");
    }
  }

  let transaction: Transaction | undefined;
  try {
    transaction = await sequelize.transaction();

    if (payment_status == PaymentStatus.COMPLETED) {
      // update all the sub orders
      await SubOrders.update(
        { order_status: OrderStatus.COMPLETED },
        { where: { order_id: order.order_id }, transaction }
      );
      //update this order
      if (payed_from_wallet) order.payed_from_wallet = true;

      await order.save({ transaction });
    }

    //create payment
    await OrdersPayment.create({ order_id, payment_status, payment_id, payment_channel }, { transaction });

    await transaction.commit();
  } catch (error: any) {
    if (transaction) {
      await transaction.rollback();
    }
    throw new ErrorResponse(error);
  }

  return order.reload();
};

//--> store/Vendor Unsettled Orders
const storeUnsettledOrders = async (req: Request) => {
  const { store_id } = req.params;
  const { limit = 100, offset = 0 } = req.query as any;
  const { role, stores } = req.user!;

  const TOLERABLE_PERIOD = moment(moment().unix() - CONSTANTS.GUARANTEE_PERIOD * 3600).toDate();

  if (!stores.includes(store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const totalUnsettled = await SubOrders.scope("basic").findAll({
    where: {
      store_id,
      order_status: OrderStatus.COMPLETED,
      delivered: true,
      settled: false,
      delivered_at: { [Op.lte]: TOLERABLE_PERIOD },
    },
    limit,
    offset,
  });

  return totalUnsettled;
};

// user cancel order
const userCancelOrder = async (req: Request) => {
  const { user_id } = req.user!;
  const { sub_order_id } = req.params;

  const sub_order = await subOrdersService.findById(sub_order_id);

  if (sub_order.purchased_by !== user_id) {
    throw new UnauthorizedError();
  }

  if (sub_order.order_status == OrderStatus.CANCELLED) {
    throw new ErrorResponse("Order already cancelled");
  }

  if (sub_order.delivered) {
    throw new ErrorResponse("Can't cancel this order");
  }

  if (sub_order.refunded) {
    throw new ErrorResponse("Order already refunded");
  }

  if (sub_order.settled) {
    throw new ErrorResponse("Refund not available(Order already settled)");
  }

  sub_order.order_status = OrderStatus.CANCELLED;
  sub_order.cancelled_by = user_id;
  await sub_order.save();

  return subOrdersService.findById(sub_order_id);
};

// admin cancel order
const adminCancelOrder = async (req: Request) => {
  const { user_id, role, stores } = req.user!;
  const { sub_order_id } = req.params;

  const sub_order = await subOrdersService.findById(sub_order_id);

  if (!isAdmin(role) && !stores.includes(sub_order.store_id)) {
    throw new UnauthorizedError();
  }

  if (sub_order.order_status == OrderStatus.CANCELLED) {
    throw new ErrorResponse("Order already cancelled");
  }

  if (sub_order.refunded) {
    throw new ErrorResponse("Order already refunded");
  }

  if (sub_order.settled) {
    throw new ErrorResponse("Order already settled");
  }

  sub_order.order_status = OrderStatus.CANCELLED;
  sub_order.cancelled_by = user_id;
  await sub_order.save();

  return subOrdersService.findById(sub_order_id);
};
// admin process refund
const processRefund = async (req: Request) => {
  const { role, user_id } = req.user!;
  const { sub_order_id } = req.params;

  const sub_order = await subOrdersService.findById(sub_order_id);
  const order = await findById(sub_order.order_id);

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  if (order.payment.payment_status !== PaymentStatus.COMPLETED) {
    throw new ErrorResponse("Payment not yet made for this order");
  }

  if (sub_order.refunded) {
    throw new ErrorResponse("Order already refunded");
  }
  if (OrderStatus.CANCELLED !== sub_order.order_status) {
    throw new ErrorResponse("Order has to be cancelled before initiating refund");
  }

  if (sub_order.settled) {
    throw new ErrorResponse("Refund not available(Order already settled)");
  }

  const deliveredAtTillNow = moment(sub_order.delivered_at).add(CONSTANTS.GUARANTEE_PERIOD, "d"); //or day, days

  const isPeriodExpired = moment(deliveredAtTillNow).isAfter();

  if (isPeriodExpired) {
    throw new ErrorResponse("Guarantee period has passed");
  }

  try {
    await sequelize.transaction(async (t) => {
      sub_order.refunded = true;
      sub_order.refunded_at = new Date();
      await sub_order.save({ transaction: t });

      //refund the user wallet
      await userWalletService.createCredit(user_id, sub_order.amount, FundingTypes.REFUND, undefined, t);
    });
  } catch (error: any) {
    throw new ErrorResponse(error);
  }

  return sub_order.reload();
};
// update order status (can't be changed once it's marked completed)
const updateOrderStatus = async (req: Request) => {
  const { role, stores } = req.user!;
  const { sub_order_id } = req.params;
  const { order_status }: { order_status: OrderStatus } = req.body;

  const sub_order = await subOrdersService.findById(sub_order_id);

  if (!isAdmin(role) && !stores.includes(sub_order_id)) {
    throw new UnauthorizedError();
  }

  if (OrderStatus.COMPLETED !== sub_order.order_status) {
    throw new ErrorResponse("Completed order can't be updated again");
  }

  sub_order.order_status = order_status;
  await sub_order.save();
  return sub_order.reload();
};

// update delivery status
const updateDeliveryStatus = async (req: Request) => {
  const { role, stores } = req.user!;
  const { sub_order_id } = req.params;
  const { delivery_status }: { delivery_status: DeliveryStatus } = req.body;

  const sub_order = await subOrdersService.findById(sub_order_id);

  if (!isAdmin(role) && !stores.includes(sub_order_id)) {
    throw new UnauthorizedError();
  }

  if (DeliveryStatus.DELIVERED == sub_order.delivery_status && delivery_status !== DeliveryStatus.AUDITED) {
    throw new ErrorResponse("Delivered order can only be audited");
  }
  if (DeliveryStatus.AUDITED === sub_order.delivery_status) {
    throw new ErrorResponse("Delivery already audited");
  }
  if (DeliveryStatus.CANCELLED === sub_order.delivery_status) {
    throw new ErrorResponse("Delivery already cancelled");
  }

  if (DeliveryStatus.DELIVERED == delivery_status) {
    sub_order.delivered = true;
    sub_order.delivered_at = new Date();
  }
  sub_order.delivery_status = delivery_status;
  await sub_order.save();
  return sub_order.reload();
};

// --> Process Teachers settlement(With order IDs)
const settleStore = async (req: Request) => {
  const { store_id, order_ids } = req.body;
  const { role } = req.user!;
  const TOLERABLE_PERIOD = moment(moment().unix() - CONSTANTS.GUARANTEE_PERIOD * 3600).toDate();

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const { total_unsettled } = await storeService.storeBalance(store_id);

  if (total_unsettled <= 0) {
    throw new ErrorResponse("Store don't have any outstanding settlement");
  }

  let settlement: VendorSettlementInstance | undefined;
  try {
    sequelize.transaction(async (t) => {
      const [_, rows] = await SubOrders.update(
        { settled: true, settled_at: new Date() },
        {
          where: {
            sub_order_id: { [Op.in]: order_ids },
            settled: false,
            delivered: true,
            delivered_at: { [Op.lte]: TOLERABLE_PERIOD },
          },
          transaction: t,
        }
      );

      const settled = rows.map((o) => o.store_price).reduce((a, b) => a + b, 0);
      const sub_order_ids = rows.map((o) => o.sub_order_id);

      settlement = await vendorSettlementService.create(sub_order_ids, settled, store_id, t);
    });
  } catch (error: any) {
    throw new ErrorResponse(error);
  }

  return settlement;
};

//find one
const findById = async (order_id: string) => {
  const order = await Orders.findOne({
    where: { order_id },
    paranoid: false,
    include: [
      { model: OrdersPayment, as: "payment", limit: 1, order: [["createdAt", "DESC"]] },
      { model: SubOrders, as: "sub_orders" },
    ],
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
};

//find many {limit, offset, createdAt}
const findAll = async (req: Request) => {
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { user_id: current_user, role } = req.user!;
  const { search_query, variation_id, order_status, coupon_code, user_id, refunded } = req.query;

  const where: { [key: string]: any } = { deletedAt: null };
  if (variation_id) {
    where.variation_id = variation_id;
  }
  if (order_status) {
    where.order_status = order_status;
  }
  if (coupon_code) {
    where.coupon_code = coupon_code;
  }
  if (user_id) {
    if (user_id !== current_user && !isAdmin(role)) {
      throw new UnauthorizedError(`Unauthorized to access ${user_id} data`);
    }
    where.user_id = user_id;
  }
  if (refunded) {
    where.refunded = refunded;
  }
  if (search_query) {
    where[Op.or as any] = [{ title: { [Op.iLike]: `%${search_query}%` } }];
  }

  const orders = await Orders.findAll({
    where,
    include: [
      { model: OrdersPayment, as: "payment", limit: 1, order: [["createdAt", "DESC"]] },
      { model: SubOrders, as: "sub_orders" },
    ],

    order: [["createdAt", "DESC"]],
    ...{ limit, offset },
  });

  return orders;
};

//find all by coupon code(Internal route)
const findAllByCouponOrUser = async (coupon_code?: string, user_id?: string, order_status?: OrderStatus) => {
  const where: { [key: string]: any } = {};

  if (coupon_code) {
    where.coupon_code = coupon_code;
  }
  if (user_id) {
    where.user_id = user_id;
  }
  if (order_status) {
    where.order_status = order_status;
  }

  const orders = await Orders.findAll({
    where,
    include: [{ model: OrdersPayment, as: "payment", limit: 1, order: [["createdAt", "DESC"]] }],
  });

  return orders;
};

//Find User Order
const findUserOrder = async (order_id: string, user_id: string) => {
  const order = await Orders.findOne({
    where: { purchased_by: user_id, order_id },
    include: [
      { model: OrdersPayment, as: "payment", limit: 1, order: [["createdAt", "DESC"]] },
      { model: SubOrders, as: "sub_orders" },
    ],
  });
  return order;
};

export default {
  create,
  updatePayment,
  storeUnsettledOrders,
  userCancelOrder,
  adminCancelOrder,
  processRefund,
  updateOrderStatus,
  updateDeliveryStatus,
  settleStore,
  findById,
  findAll,
  findAllByCouponOrUser,
};
