import Joi from "joi";

const create = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    rating: Joi.number().max(5).min(1).required(),
    message: Joi.string(),
  }),
};
const update = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    rating: Joi.number().required(),
    message: Joi.string(),
  }),
};
const checkRated = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
};
const findByProductId = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
};
const findByStoreId = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
};

export default {
  create,
  update,
  checkRated,
  findByProductId,
  findByStoreId,
};
