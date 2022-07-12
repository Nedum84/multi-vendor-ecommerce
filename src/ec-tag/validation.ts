import Joi from "joi";

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};
const update = {
  params: Joi.object().keys({
    tag_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    is_active: Joi.boolean(),
  }),
};
const findById = {
  params: Joi.object().keys({
    tag_id: Joi.string().required(),
  }),
};
const findAll = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys({
    is_active: Joi.boolean(),
  }),
};

export default {
  create,
  update,
  findById,
  findAll,
};
