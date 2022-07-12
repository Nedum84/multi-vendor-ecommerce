import Joi from "joi";

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    zip_code: Joi.number().required(),
    is_default: Joi.boolean().required(),
  }),
};
const update = {
  params: Joi.object().keys({
    address_id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      address: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zip_code: Joi.number(),
      is_default: Joi.boolean(),
    })
    .min(1),
};
const findById = {
  params: Joi.object().keys({
    address_id: Joi.string().required(),
  }),
};

const findAllByUserId = {
  params: Joi.object().keys({}),
};

export default {
  create,
  update,
  findById,
  findAllByUserId,
};
