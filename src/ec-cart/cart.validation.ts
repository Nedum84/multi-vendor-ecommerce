import Joi from "joi";

const create = {
  body: Joi.object().keys({
    variation_id: Joi.string().required(),
  }),
};
const update = {
  body: Joi.object().keys({
    variation_id: Joi.string().required(),
    action: Joi.string().valid("add", "remove").required(),
  }),
};
const clearCart = {
  body: Joi.object().keys({
    variation_id: Joi.string().required(),
  }),
};
const findAllByUserId = {
  body: Joi.object().keys({}),
};

export default {
  create,
  update,
  clearCart,
  findAllByUserId,
};
