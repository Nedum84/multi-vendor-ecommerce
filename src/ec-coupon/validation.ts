import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";
import { CouponType } from "./types";

const create = {
  body: Joi.object().keys({
    coupon_code: Joi.string().required(),
    coupon_type: Joi.string()
      .default(CouponType.PERCENTAGE)
      .valid(...Object.values(CouponType)),
    title: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date(),
    product_qty_limit: Joi.number().min(1),
    usage_limit: Joi.number().min(1),
    usage_limit_per_user: Joi.number().min(1),
    coupon_discount: Joi.when("coupon_type", {
      is: CouponType.PERCENTAGE,
      then: Joi.number().min(5).max(100).required(), //.message("percentage discount required"),
      otherwise: Joi.number().min(10).required(), //.message("coupon amount required"),
    }),
    max_coupon_amount: Joi.when("coupon_type", {
      is: CouponType.PERCENTAGE,
      then: Joi.number().min(5),
      otherwise: Joi.forbidden(),
    }),
    min_spend: Joi.number().min(1),
    max_spend: Joi.when("coupon_type", {
      is: CouponType.PERCENTAGE,
      then: Joi.when("max_coupon_amount", {
        not: undefined,
        then: Joi.number().greater(Joi.ref("max_coupon_amount")),
        otherwise: Joi.number().min(5),
      }),
      otherwise: Joi.number().greater(Joi.ref("coupon_discount")),
    }),
    enable_free_shipping: Joi.boolean().default(false),
    vendor_bears_discount: Joi.boolean().default(true),
    products: Joi.array()
      .items(
        Joi.object().keys({
          product_id: Joi.string().required(),
        })
      )
      .max(5),
    stores: Joi.array()
      .items(
        Joi.object().keys({
          store_id: Joi.string().required(),
        })
      )
      .max(5),
    users: Joi.array()
      .items(
        Joi.object().keys({
          user_id: Joi.string().required(),
        })
      )
      .max(5),
    categories: Joi.array()
      .items(
        Joi.object().keys({
          category_id: Joi.string().required(),
        })
      )
      .max(5),
  }),
};
const generateCoupon = {
  body: Joi.object().keys({}),
};
const revokeCoupon = {
  body: Joi.object().keys({
    coupon_code: Joi.string().required(),
  }),
};

const applyCoupon = {
  body: Joi.object().keys({
    coupon_code: Joi.string().required(),
  }),
};
const validateCouponExist = {
  body: Joi.object().keys({
    coupon_code: Joi.string().required(),
  }),
};
const findByCouponCode = {
  params: Joi.object().keys({
    coupon_code: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};
const findAllByStoreId = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    store_id: Joi.string().required(),
    coupon_type: Joi.string().valid(...Object.values(CouponType)),
    ...paginateDefault,
  }),
  body: Joi.object().keys({}),
};
const findAll = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    coupon_type: Joi.string().valid(...Object.values(CouponType)),
    store_id: Joi.string(),
    search_query: Joi.string(),
    ...paginateDefault,
  }),
  body: Joi.object().keys({}),
};

export default {
  create,
  generateCoupon,
  revokeCoupon,
  applyCoupon,
  validateCouponExist,
  findByCouponCode,
  findAllByStoreId,
  findAll,
};
