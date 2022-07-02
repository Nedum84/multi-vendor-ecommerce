import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";

const withdraw = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
  }),
};
const adminProcessWithdrawal = {
  params: Joi.object().keys({
    withdrawal_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};
const adminDeclineWithdrawal = {
  params: Joi.object().keys({
    withdrawal_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    declined_reason: Joi.string().required(),
  }),
};
const findForUser = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    processed: Joi.boolean(),
    ...paginateDefault,
  }),
};
const adminFindAll = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    processed: Joi.boolean(),
    is_declined: Joi.boolean(),
    user_id: Joi.string(),
    ...paginateDefault,
  }),
};

export default {
  withdraw,
  adminProcessWithdrawal,
  adminDeclineWithdrawal,
  findForUser,
  adminFindAll,
};
