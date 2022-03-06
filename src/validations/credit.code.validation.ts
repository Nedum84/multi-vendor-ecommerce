import Joi from "joi";
import { paginateDefault } from ".";
import { CreditCodeType } from "../enum/credit.code.enum";

const create = {
  body: Joi.object().keys({
    credit_code: Joi.string().required(),
    credit_type: Joi.string()
      .required()
      .valid(...Object.values(CreditCodeType)),
    title: Joi.string().required(),
    amount: Joi.number().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date(),
    usage_limit: Joi.number().min(1),
    users: Joi.array()
      .items(
        Joi.object().keys({
          user_id: Joi.string().required(),
        })
      )
      .max(10),
  }),
};
const generateCreditCode = {
  body: Joi.object().keys({}),
};
const revokeCreditCode = {
  body: Joi.object().keys({
    credit_code: Joi.string().required(),
  }),
};

const validateCreditCodeExist = {
  body: Joi.object().keys({
    credit_code: Joi.string().required(),
  }),
};
const findByCreditCodeCode = {
  params: Joi.object().keys({
    credit_code: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};
const findAll = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    credit_type: Joi.string().valid(...Object.values(CreditCodeType)),
    search_query: Joi.string(),
    ...paginateDefault,
  }),
  body: Joi.object().keys({}),
};

export default {
  create,
  generateCreditCode,
  revokeCreditCode,
  validateCreditCodeExist,
  findByCreditCodeCode,
  findAll,
};
