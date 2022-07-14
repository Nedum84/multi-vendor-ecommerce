import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";
import { DeliveryStatus, OrderStatus } from "./types";
import { ValidatorInterface } from "../ec-joi-schema/types";

const create = {
  params: Joi.object().keys({}),
  body: Joi.object()
    .keys({
      coupon_code: Joi.string(),
      address_id: Joi.string().required(),
    })
    .min(1),
};
const updatePayment = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    order_id: Joi.string().required(),
    payed_from_wallet: Joi.boolean().required(),
    buy_now_pay_later: Joi.when("payed_from_wallet", {
      is: false,
      then: Joi.object({
        account_no: Joi.string().required(),
        code: Joi.string().required(),
      }).required(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const adminUpdatePayment = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    order_id: Joi.string().required(),
    payed_from_wallet: Joi.boolean(),
  }),
};

const storeUnsettledOrders = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
  query: Joi.object().keys(paginateDefault),
};
const userCancelOrder = {
  params: Joi.object().keys({
    store_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};

const adminCancelOrder: ValidatorInterface = {
  params: Joi.object().keys({
    store_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};
const processRefund: ValidatorInterface = {
  params: Joi.object().keys({
    store_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    amount: Joi.number().min(1),
  }),
};
const updateOrderStatus: ValidatorInterface = {
  params: Joi.object().keys({
    store_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    order_status: Joi.string()
      .required()
      .valid(...Object.values(OrderStatus)),
  }),
};
const updateDeliveryStatus: ValidatorInterface = {
  params: Joi.object().keys({
    store_order_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    delivery_status: Joi.string()
      .required()
      .valid(...Object.values(DeliveryStatus)),
  }),
};
const settleStore: ValidatorInterface = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    store_id: Joi.string().required(),
    store_order_ids: Joi.array().items(Joi.string().required()).min(2),
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
    order_status: Joi.string().valid(...Object.values(OrderStatus)),
    coupon_code: Joi.string(),
    user_id: Joi.string(),
    refunded: Joi.boolean(),
    store_id: Joi.string(),
    amount: Joi.number(),
  }),
};

export default {
  create,
  updatePayment,
  adminUpdatePayment,
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
