import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";
import { PaymentChannel } from "./types";

const topUserAccount = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    amount: Joi.number().required().min(2),
    transaction_fee: Joi.number().default(0),
    payment_reference: Joi.string().required(),
    payment_channel: Joi.string()
      .required()
      .valid(...Object.values(PaymentChannel)),
  }),
};

const findById = {
  params: Joi.object().keys({
    topup_id: Joi.string().required(),
  }),
};

const findAllUser = {
  params: Joi.object().keys({}),
  query: Joi.object({
    date_from: Joi.date(),
    date_to: Joi.date(),
    ...paginateDefault,
  }),
};

const findAllAdmin = {
  query: Joi.object().keys({
    user_id: Joi.string(),
    payment_channel: Joi.string().valid(...Object.values(PaymentChannel)),
    payment_reference: Joi.string(),
    topup_id: Joi.string(),
    date_from: Joi.date(),
    date_to: Joi.date(),
    ...paginateDefault,
  }),
};

export default {
  topUserAccount,
  findById,
  findAllUser,
  findAllAdmin,
};
