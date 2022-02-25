import { Transaction } from "sequelize/dist";
import { NotFoundError } from "../apiresponse/not.found.error";
import { DeliveryStatus, OrderStatus } from "../enum/orders.enum";
import { Orders, SubOrders, SubOrdersProduct } from "../models";
import { CartInstance } from "../models/cart.model";
import { CouponInstance } from "../models/coupon.model";
import { SubOrdersAttributes } from "../models/sub.orders.model";
import { asyncForEach } from "../utils/function.utils";
import { genUniqueColId } from "../utils/random.string";
import cartService from "./cart.service";
import couponService from "./coupon.service";
import shippingService from "./shipping.service";
import storeService from "./store.service";
import subOrdersProductService from "./sub.orders.product.service";

const create = async (
  order_id: string,
  store_id: string,
  user_id: string,
  address_id: string,
  carts: CartInstance[],
  transaction: Transaction,
  couponData?: { coupon_amount: number; sub_total: number; coupon: CouponInstance }
) => {
  // OR removing carts from params and passing user_id,
  // With that you can access the carts via
  // const {carts} = await cartService.findAllByUserId(user_id);
  const store = await storeService.findById(store_id);
  const storeCarts = carts.filter((c) => c.store_id === store_id);
  const variation_ids = storeCarts.map((c) => c.variation_id);

  const sub_total = cartService.getSubTotal(storeCarts);
  let storeCouponAmount = 0;

  if (couponData) {
    const { coupon } = couponData;
    storeCouponAmount = couponService.findStoreCouponAmount(coupon, carts, store_id, user_id);
  }

  const store_shipping = await shippingService.getStoreShipping(store_id, variation_ids, address_id);
  const store_tax_amount = 0;
  const amount = sub_total - storeCouponAmount + store_shipping + store_tax_amount;
  const store_price = (sub_total - storeCouponAmount) * (store.store_percentage / 100);

  const sub_order_id = await genUniqueColId(SubOrders, "sub_order_id", 10, "alphanumeric", "uppercase");

  const subOrderAttrs: SubOrdersAttributes = {
    sub_order_id,
    store_id,
    amount,
    sub_total,
    coupon_amount: storeCouponAmount,
    shipping_amount: store_shipping,
    tax_amount: store_tax_amount, //As above, do same to this guy later with each product(variation) taxz....
    order_id,
    order_status: OrderStatus.PENDING,
    delivery_status: DeliveryStatus.NOT_PICKED,
    store_price,
    purchased_by: user_id,
    ...({} as any),
  };
  const subOrder = await SubOrders.create(subOrderAttrs, { transaction });

  //create sub order products
  await asyncForEach(storeCarts, async (cart) => {
    //Create Order products
    await subOrdersProductService.create(sub_order_id, cart, transaction);
  });

  return subOrder;
};

//find one
const findById = async (sub_order_id: string) => {
  const order = await SubOrders.findOne({
    where: { sub_order_id },
    paranoid: false,
    include: [
      { model: Orders, as: "order" },
      { model: SubOrdersProduct, as: "products" },
    ],
  });
  if (!order) {
    throw new NotFoundError("Sub Order not found");
  }

  return order;
};

const findAllByOrderId = async (order_id: string, transaction?: Transaction) => {
  const orders = await SubOrders.findAll({
    where: { order_id },
    transaction,
    include: [
      { model: Orders, as: "order" },
      { model: SubOrdersProduct, as: "products" },
    ],
  });
  return orders;
};

export default {
  create,
  findById,
  findAllByOrderId,
};
