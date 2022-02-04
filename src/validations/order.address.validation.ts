import Joi from "joi";
import { paginateDefault } from ".";

const findAll = {
  query: Joi.object().keys({
    order_id: Joi.string(),
    email: Joi.string(),
    ...paginateDefault,
  }),
};

export default { findAll };
