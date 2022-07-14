import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";
import { TransactionOperation } from "./types";

const balance = {
  params: Joi.object().keys({}),
};
const findById = {
  params: Joi.object().keys({
    transaction_id: Joi.string().required(),
  }),
};

const findAll = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys({
    transaction_id: Joi.string(),
    operation: Joi.string().valid(...Object.values(TransactionOperation)),
    date_from: Joi.date(),
    date_to: Joi.date(),
    ...paginateDefault,
  }),
};

const adminFindAll = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys({
    user_id: Joi.string(),
    transaction_id: Joi.string(),
    operation: Joi.string().valid(...Object.values(TransactionOperation)),
    date_from: Joi.date(),
    date_to: Joi.date(),
    ...paginateDefault,
  }),
};

export default { balance, findById, findAll, adminFindAll };
