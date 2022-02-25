import Joi from "joi";
import { paginateDefault } from ".";

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

export default {
  getWalletBalance,
  balanceHistory,
  adminCreateCreditReward,
  userCreateCreditReward,
};
