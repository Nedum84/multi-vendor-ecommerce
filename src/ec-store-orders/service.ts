import { Transaction } from "sequelize";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { DeliveryStatus, OrderStatus } from "../ec-orders/types";
import { Orders, StoreOrders, StoreOrdersProduct } from "../ec-models";
import { CartInstance } from "../ec-cart/model";
import { StoreOrdersAttributes } from "./model";
import { genUniqueColId } from "../ec-models/utils";
import shippingService from "../ec-orders-shipping/service";
import storeService from "../ec-store/service";
import storeOrdersProductService from "../ec-store-orders-products/service";
import { calcStoreCouponAmount } from "../ec-coupon/utils";
import { calcCartSubTotal } from "../ec-cart/utils";
import { ApplyCouponResponse } from "../ec-coupon/types";

const create = async (
  order_id: string,
  store_id: string,
  user_id: string,
  address_id: string,
  carts: CartInstance[],
  transaction: Transaction,
  couponData?: ApplyCouponResponse
) => {
  // OR removing carts from params and passing user_id,
  // With that you can access the carts via
  // const {carts} = await cartService.findAllByUserId(user_id);
  const store = await storeService.findById(store_id);
  const storeCarts = carts.filter((c) => c.store_id === store_id);
  const variationIds = storeCarts.map((c) => c.variation_id);

  const cartSubTotal = calcCartSubTotal(storeCarts);
  let storeCouponAmount = 0;

  if (couponData) {
    const { coupon, coupon_amount, coupon_amount_without_cap } = couponData;
    storeCouponAmount = await calcStoreCouponAmount({
      coupon,
      carts,
      storeId: store_id,
      couponAmount: coupon_amount,
      couponAmountWithoutCap: coupon_amount_without_cap,
    });
  }

  const storeShipping = await shippingService.getStoreShipping(store_id, variationIds, address_id);
  const storeTaxAmount = 0;
  const amount = cartSubTotal - storeCouponAmount + storeShipping + storeTaxAmount;
  // If Vendor/Store bears the cost of the coupon or the company
  let storePrice = 0;
  if (storeCouponAmount !== 0 && couponData?.coupon.vendor_bears_discount) {
    storePrice = (cartSubTotal - storeCouponAmount) * (store.store_percentage / 100);
  } else {
    storePrice = cartSubTotal * (store.store_percentage / 100);
  }

  const storeOrderId = await genUniqueColId(
    StoreOrders,
    "store_order_id",
    12,
    "alphanumeric",
    "uppercase"
  );

  const subOrderAttrs: StoreOrdersAttributes = {
    store_order_id: storeOrderId,
    store_id,
    amount,
    sub_total: cartSubTotal,
    coupon_amount: storeCouponAmount !== 0 ? storeCouponAmount : undefined,
    shipping_amount: storeShipping,
    tax_amount: storeTaxAmount, //As above, do same to this guy later with each product(variation) taxz....
    order_id,
    order_status: OrderStatus.PENDING,
    delivery_status: DeliveryStatus.NOT_PICKED,
    store_price: storePrice,
    purchased_by: user_id,
    ...({} as any),
  };
  const subOrder = await StoreOrders.create(subOrderAttrs, { transaction });

  //create store order products
  for await (const cart of storeCarts) {
    //Create Order products
    await storeOrdersProductService.create(storeOrderId, cart, transaction);
  }

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
