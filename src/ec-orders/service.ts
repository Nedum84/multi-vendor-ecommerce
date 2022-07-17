import { Request } from "express";
import sequelize, { StoreOrders, Orders, OrdersAddress, StoreOrdersProduct } from "../ec-models";
import { Op, Transaction } from "sequelize";
import { DeliveryStatus, OrderStatus } from "./types";
import moment from "moment";
import userWalletService from "../ec-user-wallet/service";
import cartService from "../ec-cart/service";
import couponService from "../ec-coupon/service";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import shippingService from "../ec-orders-shipping/service";
import { genUniqueColId, getPaginate } from "../ec-models/utils";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { isAdmin } from "../ec-apps/app-admin/roles.service";
import storeService from "../ec-store/service";
import vendorSettlementService from "../ec-vendor-settlement/service";
import userAddressService from "../ec-user-address/service";
import orderAddressService from "../ec-orders-address/service";
import storeOrdersService from "../ec-store-orders/service";
import { VendorSettlementInstance } from "../ec-vendor-settlement/model";
import { RETURNABLE_DAYS_MILLISECONDS, RETURNABLE_PERIOD } from "./constants";
import { ApplyCouponResponse } from "../ec-coupon/types";
import { validateCartProductsQty } from "../ec-cart/utils";
import transactionService from "../ec-transaction/service";
import { TransactionOperation } from "../ec-transaction/types";
import { validateOrderCreated } from "./utils";

//create
const create = async (req: Request) => {
  const { user_id } = req.user!;
  const { coupon_code, address_id }: { coupon_code: string; address_id: string } = req.body;

  const userCarts = await cartService.findAllByUserId(user_id);
  const carts = userCarts.carts;

  // -->check product qty avaialability
  if (!carts.length) {
    throw new BadRequestError("No product found on the cart");
  }
  // -->check product qty avaialability
  if (!validateCartProductsQty(carts)) {
    throw new BadRequestError("One or more Item is currently out of stock");
  }

  let couponData: ApplyCouponResponse | undefined;

  //validate & apply coupon
  if (coupon_code) {
    couponData = await couponService.applyCoupon(user_id, coupon_code);
  }

  const coupon_amount = couponData ? couponData.coupon_amount : 0;
  const overall_tax_amount = 0;
  const overall_shipping_amount = await shippingService.getTotalShipping(carts, address_id);
  const overall_amount =
    userCarts.sub_total - coupon_amount + overall_shipping_amount + overall_tax_amount;
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
    const uniqueStoreIds = Array.from(new Set(cartStoreIds));

    //Create sub orders for each store(store orders)
    for await (const store_id of uniqueStoreIds) {
      await storeOrdersService.create(
        order_id,
        store_id,
        user_id,
        address_id,
        carts,
        transaction,
        couponData
      );
    }

    // Create order address
    const userAddress = await userAddressService.findById(address_id);
    await orderAddressService.create(userAddress, order_id, transaction);
    // clear the cart
    await cartService.clearCart(user_id, undefined, transaction);

    return { order };
  }); //Transaction ends...

  return findById(result.order.order_id);
};

// update order payment (Pay for already created ORDER)
const updatePayment = async (req: Request) => {
  const { user_id } = req.user!;

  const {
    order_id,
    payed_from_wallet,
    buy_now_pay_later,
  }: {
    order_id: string;
    payed_from_wallet: boolean;
    buy_now_pay_later: {
      account_no: string;
      code: string;
    };
  } = req.body;

  const subOrder = await StoreOrders.findOne({ where: { store_order_id: order_id } });
  const orderId = subOrder ? subOrder.order_id : order_id;

  const order = await Orders.findOne({
    where: { order_id: orderId },
    include: [
      {
        model: StoreOrders,
        as: "store_orders",
        include: [{ model: StoreOrdersProduct, as: "products" }],
      },
    ],
  });

  if (!order) {
    throw new BadRequestError("Order not found");
  }

  if (order.purchased_by !== user_id) {
    throw new ForbiddenError();
  }

  if (order.store_orders.find((o) => o.order_status == OrderStatus.CANCELLED)) {
    throw new BadRequestError("one or more StoreOrders already cancelled");
  }

  if (order.payment_completed) {
    throw new BadRequestError("This order is already payed for");
  }

  if (buy_now_pay_later) {
    // TODO: Verify details
  }

  if (payed_from_wallet) {
    const balance = await userWalletService.balance(user_id);
    if (balance < order.amount) {
      throw new BadRequestError("Insufficient balance to purchase the order from wallet");
    }
  }

  try {
    await sequelize.transaction(async (transaction) => {
      // update this order
      order.payment_completed = true;
      order.payed_from_wallet = payed_from_wallet;
      order.buy_now_pay_later = buy_now_pay_later;
      await order.save({ transaction });

      // update all the store orders for stores with auto_complete_order == true
      for await (const subOrder of order.store_orders) {
        const { store_id } = subOrder;
        const { settings } = await storeService.findById(store_id, transaction);
        if (settings.auto_complete_order) {
          await StoreOrders.update(
            { order_status: OrderStatus.COMPLETED },
            { where: { order_id: order.order_id, store_id }, transaction }
          );
        }
      }

      // Validate orders + Update product qty &/or product flashsale sold
      await validateOrderCreated(order, transaction);

      // Debit the user's wallet
      if (payed_from_wallet) {
        await transactionService.create(
          {
            amount: order.amount,
            desc: `Charge for order ${orderId}`,
            operation: TransactionOperation.REMOVE,
            reference_id: orderId,
            user_id: order.purchased_by,
          },
          transaction
        );
      }
    });
  } catch (err) {
    throw new BadRequestError(err);
  }

  return findById(order.order_id);
};
//Admin update order payment
const adminUpdatePayment = async (req: Request) => {
  const { role } = req.user!;
  const body: { order_id: string; payed_from_wallet: boolean } = req.body;
  const { order_id, payed_from_wallet } = body;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const subOrder = await StoreOrders.findOne({ where: { store_order_id: order_id } });
  const orderId = subOrder ? subOrder.order_id : order_id;

  const order = await Orders.findOne({
    where: { order_id: orderId },
    include: [
      {
        model: StoreOrders,
        as: "store_orders",
        include: [{ model: StoreOrdersProduct, as: "products" }],
      },
    ],
  });

  if (!order) {
    throw new BadRequestError("Order not found");
  }

  if (order.store_orders.find((o) => o.order_status == OrderStatus.CANCELLED)) {
    throw new BadRequestError("one or more StoreOrders already cancelled");
  }

  if (order.payment_completed) {
    throw new BadRequestError("Payment is already made for this order");
  }

  if (payed_from_wallet) {
    const balance = await userWalletService.balance(order.purchased_by);
    if (balance < order.amount) {
      throw new BadRequestError("Insufficient balance to purchase the order from wallet");
    }
  }

  try {
    await sequelize.transaction(async (transaction) => {
      // Update order
      order.payment_completed = true;
      order.payed_from_wallet = payed_from_wallet;
      await order.save({ transaction });

      // update all the sub orders for stores with auto_complete_order == true
      for await (const subOrder of order.store_orders) {
        const { store_id } = subOrder;
        const { settings } = await storeService.findById(store_id, transaction);
        if (settings.auto_complete_order) {
          await StoreOrders.update(
            { order_status: OrderStatus.COMPLETED },
            { where: { order_id: order.order_id, store_id }, transaction }
          );
        }
      }

      // Validate orders + Update product qty &/or product flashsale sold
      await validateOrderCreated(order, transaction);

      // Debit the user's wallet
      if (payed_from_wallet) {
        await transactionService.create(
          {
            amount: order.amount,
            desc: `Charge for order ${orderId}`,
            operation: TransactionOperation.REMOVE,
            reference_id: orderId,
            user_id: order.purchased_by,
          },
          transaction
        );
      }
    });
  } catch (error: any) {
    throw new BadRequestError(error);
  }

  return findById(order!.order_id);
};

// update order status (can't be changed once it's marked completed)
const updateOrderStatus = async (req: Request) => {
  const { role, stores, user_id } = req.user!;
  const { store_order_id } = req.params;
  const { order_status }: { order_status: OrderStatus } = req.body;

  const sub_order = await storeOrdersService.findById(store_order_id);

  if (!isAdmin(role) && !stores.includes(store_order_id)) {
    throw new ForbiddenError();
  }

  if (OrderStatus.CANCELLED == sub_order.order_status) {
    throw new BadRequestError("Order already cancelled");
  }
  if (OrderStatus.COMPLETED === sub_order.order_status) {
    throw new BadRequestError("Completed order can't be updated");
  }

  if (sub_order.refunded) {
    throw new BadRequestError("Refunded order can't be updated");
  }
  if (sub_order.settled) {
    throw new BadRequestError("Settled order can't be updated");
  }

  if (order_status === OrderStatus.CANCELLED) {
    sub_order.cancelled_by = user_id;
  }
  sub_order.order_status = order_status;
  await sub_order.save();
  return storeOrdersService.findById(store_order_id);
};

// update delivery status
const updateDeliveryStatus = async (req: Request) => {
  const { role, stores } = req.user!;
  const { store_order_id } = req.params;
  const { delivery_status }: { delivery_status: DeliveryStatus } = req.body;

  const sub_order = await storeOrdersService.findById(store_order_id);

  if (!isAdmin(role) && !stores.includes(store_order_id)) {
    throw new ForbiddenError();
  }

  if (OrderStatus.CANCELLED === sub_order.order_status) {
    throw new BadRequestError("This order is already cancelled");
  }

  if (DeliveryStatus.DELIVERED === sub_order.delivery_status) {
    if (delivery_status !== DeliveryStatus.AUDITED) {
      throw new BadRequestError("Delivered order can only be audited");
    }
  }

  if (delivery_status == DeliveryStatus.DELIVERED && !sub_order.order.payment_completed) {
    throw new BadRequestError('"None paid" order can\'t be marked "Delivered"');
  }

  if (DeliveryStatus.AUDITED === sub_order.delivery_status) {
    throw new BadRequestError("Delivery already audited & can't be updated further");
  }
  if (DeliveryStatus.CANCELLED === sub_order.delivery_status) {
    throw new BadRequestError("Delivery already cancelled");
  }

  if (sub_order.settled) {
    throw new BadRequestError("Settled order can't be updated");
  }

  if (
    sub_order.order_status !== OrderStatus.COMPLETED &&
    delivery_status == DeliveryStatus.DELIVERED
  ) {
    throw new BadRequestError(
      "None completed order can't be marked delivered. Mark order status to completed to proceed"
    );
  }

  if (DeliveryStatus.DELIVERED == delivery_status) {
    sub_order.delivered = true;
    sub_order.delivered_at = new Date();
  }

  sub_order.delivery_status = delivery_status;
  await sub_order.save();
  return storeOrdersService.findById(store_order_id);
};

// user cancel order
const userCancelOrder = async (req: Request) => {
  const { user_id } = req.user!;
  const { store_order_id } = req.params;

  const sub_order = await storeOrdersService.findById(store_order_id);

  if (sub_order.purchased_by !== user_id) {
    throw new ForbiddenError();
  }

  if (sub_order.order_status == OrderStatus.CANCELLED) {
    throw new BadRequestError("Order already cancelled");
  }

  if (sub_order.delivered) {
    throw new BadRequestError("Can't cancel this order");
  }

  if (sub_order.refunded) {
    throw new BadRequestError("Order already refunded");
  }

  if (sub_order.settled) {
    throw new BadRequestError("Refund not available(Order already settled)");
  }

  sub_order.order_status = OrderStatus.CANCELLED;
  sub_order.cancelled_by = user_id;
  await sub_order.save();

  return storeOrdersService.findById(store_order_id);
};

// admin process refund
const processRefund = async (req: Request) => {
  const { role } = req.user!;
  const { store_order_id } = req.params;
  const { amount }: { amount: number } = req.body;

  const store_order = await storeOrdersService.findById(store_order_id);
  const order = await findById(store_order.order_id);

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  if (amount > store_order.amount) {
    throw new BadRequestError(`Refund amount must be lower or equal ${store_order.amount}`);
  }
  if (!order.payment_completed) {
    throw new BadRequestError("Payment not yet made for this order");
  }

  if (store_order.refunded) {
    throw new BadRequestError("Order already refunded");
  }
  if (OrderStatus.CANCELLED !== store_order.order_status) {
    throw new BadRequestError("Order has to be cancelled before initiating refund");
  }

  if (store_order.settled) {
    throw new BadRequestError("Refund not available(Order already settled)");
  }

  const deliveredAtTillNow = moment(store_order.delivered_at).add(
    RETURNABLE_DAYS_MILLISECONDS,
    "d"
  ); //or day, days

  const isPeriodExpired = moment(deliveredAtTillNow).isAfter();

  if (isPeriodExpired) {
    throw new BadRequestError("Guarantee period has passed");
  }

  try {
    await sequelize.transaction(async (t) => {
      store_order.refunded = true;
      store_order.refunded_at = new Date();
      await store_order.save({ transaction: t });

      // Refund(Credit) the user that booked the schedule
      await transactionService.create(
        {
          amount,
          desc: `Refund for store order ${store_order_id}`,
          operation: TransactionOperation.ADD,
          reference_id: store_order_id,
          user_id: store_order.purchased_by,
        },
        t
      );
    });
  } catch (error: any) {
    throw new BadRequestError(error);
  }

  return storeOrdersService.findById(store_order_id);
};

// --> Process Teachers settlement(With order IDs)
const settleStore = async (req: Request) => {
  const { store_id, store_order_ids } = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  let settlement: VendorSettlementInstance | undefined;
  try {
    await sequelize.transaction(async (t) => {
      const [_, rows] = await StoreOrders.update(
        { settled: true, settled_at: new Date() },
        {
          where: {
            store_order_id: { [Op.in]: store_order_ids },
            settled: false,
            delivered: true,
            delivered_at: { [Op.lte]: RETURNABLE_PERIOD },
          },
          returning: true,
          transaction: t,
        }
      );

      const amountSettled = rows.map((o) => o.store_price).reduce((a, b) => a + b, 0);
      const updated_store_order_ids = rows.map((o) => o.store_order_id);
      settlement = await vendorSettlementService.create(
        updated_store_order_ids,
        amountSettled,
        store_id,
        t
      );
    });
  } catch (error: any) {
    throw new BadRequestError(error);
  }

  return settlement;
};

//--> store/Vendor Unsettled Orders
const storeUnsettledOrders = async (req: Request) => {
  const { store_id } = req.params;
  const { limit = 100, offset = 0 } = req.query as any;
  const { role, stores } = req.user!;

  if (!stores.includes(store_id) && !isAdmin(role)) {
    throw new ForbiddenError();
  }

  const totalUnsettled = await StoreOrders.findAll({
    where: {
      store_id,
      delivered: true,
      settled: false,
      delivered_at: { [Op.lte]: RETURNABLE_PERIOD },
    },
    limit,
    offset,
  });

  return totalUnsettled;
};

//find one
const findById = async (order_id: string, transaction?: Transaction) => {
  const order = await Orders.findOne({
    where: { order_id },
    paranoid: false,
    include: [
      {
        model: StoreOrders,
        as: "store_orders",
        include: [{ model: StoreOrdersProduct, as: "products" }],
      },
      {
        model: OrdersAddress,
        as: "address",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
};

//find many {limit, offset, createdAt}
const findAll = async (req: Request) => {
  const { limit, offset } = getPaginate(req.query);
  const { user_id: current_user, role } = req.user!;
  const { search_query, order_status, coupon_code, user_id, store_id, refunded, amount } =
    req.query;

  const where: { [key: string]: any } = {};

  if (order_status) {
    where["$store_orders.order_status$"] = order_status;
  }
  if (store_id) {
    where["$store_orders.store_id$"] = store_id;
  }
  if (coupon_code) {
    where.coupon_code = coupon_code;
  }
  if (user_id) {
    if (user_id !== current_user && !isAdmin(role)) {
      throw new ForbiddenError(`Unauthorized to access ${user_id} data`);
    }
    where.purchased_by = user_id;
  }
  if (refunded) {
    where.refunded = refunded;
  }
  if (amount) {
    where.amount = amount;
  }

  if (search_query) {
    where[Op.or as any] = [
      { order_id: { [Op.iLike]: `%${search_query}%` } },
      { ["$store_orders.store_order_id$"]: { [Op.iLike]: `%${search_query}%` } },
    ];
  }

  const orders = await Orders.findAll({
    where,
    subQuery: false,
    include: [
      {
        model: StoreOrders,
        as: "store_orders",
        include: [{ model: StoreOrdersProduct, as: "products" }],
      },
      {
        model: OrdersAddress,
        as: "address",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],

    order: [["createdAt", "DESC"]],
    ...{ limit, offset },
  });

  return orders;
};

//find all by coupon code(Internal route)
const findAllByCouponOrUser = async (coupon_code?: string, user_id?: string) => {
  const where: { [key: string]: any } = { payment_completed: true };

  if (coupon_code) {
    where.coupon_code = coupon_code;
  }
  if (user_id) {
    where.purchased_by = user_id;
  }

  const orders = await Orders.findAll({
    where,
    include: [{ model: StoreOrders, as: "store_orders" }],
  });

  return orders;
};

export default {
  create,
  updatePayment,
  adminUpdatePayment,
  updateOrderStatus,
  updateDeliveryStatus,
  userCancelOrder,
  processRefund,
  settleStore,
  storeUnsettledOrders,
  findById,
  findAll,
  findAllByCouponOrUser,
};
