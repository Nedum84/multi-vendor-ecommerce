import Joi from "joi";
import { paginateDefault } from "../ec-joi-schema/utils";

const adminProcessSettlement = {
  params: Joi.object().keys({
    settlement_id: Joi.string().required(),
  }),
  query: Joi.object().keys(),
};
const findById = {
  params: Joi.object().keys({
    settlement_id: Joi.string().required(),
  }),
  query: Joi.object().keys(),
};

const findAllByStoreId = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
  query: Joi.object().keys(paginateDefault),
};

export default { adminProcessSettlement, findById, findAllByStoreId };
