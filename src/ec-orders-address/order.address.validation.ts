import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";

const findAll = {
  query: Joi.object().keys({
    order_id: Joi.string(),
    email: Joi.string(),
    ...paginateDefault,
  }),
};

export default { findAll };
