import Joi from "joi";
import { paginateDefault } from ".";
import { PaymentChannel } from "../enum/payment.enum";

const adminCreateCreditReward = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
  body: Joi.object().keys({
    user_id: Joi.string().required(),
    amount: Joi.number().required(),
  }),
};

const userCreateCreditReward = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    amount: Joi.number().required(),
    payment_reference: Joi.string().required(),
    channel: Joi.string()
      .required()
      .valid(...Object.values(PaymentChannel)),
  }),
};
const userRedeemCreditReward = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    credit_code: Joi.string().required(),
  }),
};

const getWalletBalance = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
};

const balanceHistory = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys({
    ...paginateDefault,
  }),
};
const withrawableBalance = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};

export default {
  adminCreateCreditReward,
  userCreateCreditReward,
  userRedeemCreditReward,
  getWalletBalance,
  balanceHistory,
  withrawableBalance,
};
