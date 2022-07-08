import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";
import { CouponApplyFor, CouponType } from "./types";

const create = {
  body: Joi.object().keys({
    coupon_code: Joi.string().required(),
    coupon_apply_for: Joi.string()
      .required()
      .valid(...Object.values(CouponApplyFor)),
    coupon_type: Joi.string()
      .default(CouponType.PERCENTAGE)
      .valid(...Object.values(CouponType)),
    title: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date(),
    product_qty_limit: Joi.number().min(1),
    usage_limit: Joi.number().min(1),
    usage_limit_per_user: Joi.number().min(1),
    percentage_discount: Joi.string().when("coupon_type", {
      is: CouponType.PERCENTAGE,
      then: Joi.number().min(5).max(100).required(),
      otherwise: Joi.forbidden(),
    }),
    fixed_price_coupon_amount: Joi.string().when("coupon_type", {
      is: CouponType.FIXED_AMOUNT,
      then: Joi.number().min(1).required(),
      otherwise: Joi.forbidden(),
    }),
    max_coupon_amount: Joi.number().min(1),
    min_spend: Joi.number().min(1),
    max_spend: Joi.number().min(1),
    enable_free_shipping: Joi.boolean().default(false),
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
    coupon_apply_for: Joi.string().valid(...Object.values(CouponApplyFor)),
    ...paginateDefault,
  }),
  body: Joi.object().keys({}),
};
const findAll = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    coupon_apply_for: Joi.string().valid(...Object.values(CouponApplyFor)),
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
