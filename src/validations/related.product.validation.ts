import Joi from "joi";

const create = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    related_product_ids: Joi.array().items(Joi.string()).required(),
  }),
};
const remove = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    related_product_ids: Joi.string().required(),
  }),
};
const findForProduct = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
};
export default {
  create,
  remove,
  findForProduct,
};
