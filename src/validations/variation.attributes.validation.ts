import Joi from "joi";

const createAttribute = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    desc: Joi.string(),
  }),
  query: Joi.object().keys({}),
};

const updateAttribute = {
  params: Joi.object().keys({
    attribute_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    desc: Joi.string(),
  }),
  query: Joi.object().keys({}),
};

const findAllAttributes = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};

const createAttributeSet = {
  params: Joi.object().keys({
    attribute_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    value: Joi.string().required(),
    color: Joi.string(),
    image: Joi.string(),
  }),
  query: Joi.object().keys({}),
};
const updateAttributeSet = {
  params: Joi.object().keys({
    attribute_set_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    value: Joi.string(),
    color: Joi.string(),
    image: Joi.string(),
  }),
  query: Joi.object().keys({}),
};
const findAttributeSetsByAttributeId = {
  params: Joi.object().keys({
    attribute_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};

const createProductAttributes = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    attribute_ids: Joi.array().items(Joi.string().required()).required(),
  }),
  query: Joi.object().keys({}),
};
const findProductAttributes = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};

export default {
  createAttribute,
  updateAttribute,
  findAllAttributes,

  createAttributeSet,
  updateAttributeSet,
  findAttributeSetsByAttributeId,

  createProductAttributes,
  findProductAttributes,
};
