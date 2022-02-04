import Joi from "joi";
import { paginateDefault, ValidatorInterface } from ".";
import { DeliveryStatus, OrderStatus } from "../enum/orders.enum";
import { PaymentChannel, PaymentStatus } from "../enum/payment.enum";

const updatePayment = {
  params: Joi.object().keys({
    order_id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      payment_status: Joi.string()
        .required()
        .valid(...Object.values(PaymentStatus)),
      payment_channel: Joi.string()
        .required()
        .valid(...Object.values(PaymentChannel)),
      payment_id: Joi.string().required(),
      payed_from_wallet: Joi.boolean(),
    })
    .min(1),
};

const storeUnsettledOrders = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
  query: Joi.object().keys(paginateDefault),
};
const userCancelOrder = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};

const adminCancelOrder: ValidatorInterface = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};
const processRefund: ValidatorInterface = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};
const updateOrderStatus: ValidatorInterface = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    order_status: Joi.string()
      .required()
      .valid(...Object.values(OrderStatus)),
  }),
};
const updateDeliveryStatus: ValidatorInterface = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    delivery_status: Joi.string()
      .required()
      .valid(...Object.values(DeliveryStatus)),
  }),
};
const settleStore: ValidatorInterface = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    store_id: Joi.string().required(),
    order_ids: Joi.array().required().items(Joi.string().required()),
  }),
};
const findById: ValidatorInterface = {
  params: Joi.object().keys({
    order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};
const findAll: ValidatorInterface = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    search_query: Joi.string(),
    variation_id: Joi.string(),
    order_status: Joi.string().valid(...Object.values(OrderStatus)),
    coupon_code: Joi.string(),
    user_id: Joi.string(),
    refunded: Joi.boolean(),
  }),
};

export default {
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
};
