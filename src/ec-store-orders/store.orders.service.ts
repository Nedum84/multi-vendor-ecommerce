import { Transaction } from "sequelize";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { DeliveryStatus, OrderStatus } from "../ec-orders/types";
import { Orders, StoreOrders, StoreOrdersProduct } from "../ec-models";
import { CartInstance } from "../ec-cart/cart.model";
import { CouponInstance } from "../ec-coupon/coupon.model";
import { StoreOrdersAttributes } from "./store.orders.model";
import { asyncForEach } from "../ec-utils/function.utils";
import { genUniqueColId } from "../ec-models/utils";
import cartService from "../ec-cart/cart.service";
import couponService from "../ec-coupon/coupon.service";
import shippingService from "../ec-orders/shipping.service";
import storeService from "../ec-store/store.service";
import storeOrdersProductService from "../ec-store-orders-products/store.orders.product.service";

const create = async (
  order_id: string,
  store_id: string,
  user_id: string,
  address_id: string,
  carts: CartInstance[],
  transaction: Transaction,
  couponData?: {
    coupon_amount: number;
    coupon_amount_without_cap: number;
    sub_total: number;
    coupon: CouponInstance;
  }
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
    const { coupon, coupon_amount, coupon_amount_without_cap } = couponData;
    storeCouponAmount = couponService.findStoreCouponAmount(coupon, carts, store_id, user_id);

    //...
    if (storeCouponAmount != 0) {
      if (coupon.max_coupon_amount) {
        storeCouponAmount = (storeCouponAmount / coupon_amount_without_cap) * coupon_amount;
      }
    }
  }

  const store_shipping = await shippingService.getStoreShipping(
    store_id,
    variation_ids,
    address_id
  );
  const store_tax_amount = 0;
  const amount = sub_total - storeCouponAmount + store_shipping + store_tax_amount;
  const store_price = (sub_total - storeCouponAmount) * (store.store_percentage / 100);

  const store_order_id = await genUniqueColId(
    StoreOrders,
    "store_order_id",
    10,
    "alphanumeric",
    "uppercase"
  );

  const subOrderAttrs: StoreOrdersAttributes = {
    store_order_id: store_order_id,
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
  const subOrder = await StoreOrders.create(subOrderAttrs, { transaction });

  //create sub order products
  await asyncForEach(storeCarts, async (cart) => {
    //Create Order products
    await storeOrdersProductService.create(store_order_id, cart, transaction);
  });

  return subOrder;
};

//find one
const findById = async (store_order_id: string) => {
  const order = await StoreOrders.findOne({
    where: { store_order_id: store_order_id },
    paranoid: false,
    include: [
      { model: Orders, as: "order" },
      { model: StoreOrdersProduct, as: "products" },
    ],
  });
  if (!order) {
    throw new NotFoundError("Sub Order not found");
  }

  return order;
};

const findAllByOrderId = async (order_id: string, transaction?: Transaction) => {
  const orders = await StoreOrders.findAll({
    where: { order_id },
    transaction,
    include: [
      { model: Orders, as: "order" },
      { model: StoreOrdersProduct, as: "products" },
    ],
  });
  return orders;
};

export default {
  create,
  findById,
  findAllByOrderId,
};