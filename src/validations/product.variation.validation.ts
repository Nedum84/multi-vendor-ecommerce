import Joi from "joi";
import { StockStatus } from "../enum/product.enum";

const create = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    sku: Joi.string(),
    price: Joi.number().required(),
    with_storehouse_management: Joi.boolean().default(true),
    stock_status: Joi.string()
      .valid(...Object.values(StockStatus))
      .default(StockStatus.IN_STOCK),
    stock_qty: Joi.number(),
    weight: Joi.number(),
    length: Joi.number(),
    height: Joi.number(),
    width: Joi.number(),
    //attr set ids
    attribute_set_ids: Joi.array().items(Joi.string().required()).default([]),
  }),
};
const update = {
  params: Joi.object().keys({
    variation_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    sku: Joi.string(),
    price: Joi.number(),
    with_storehouse_management: Joi.boolean(),
    stock_status: Joi.string()
      .valid(...Object.values(StockStatus))
      .default(StockStatus.IN_STOCK),
    stock_qty: Joi.number(),
    weight: Joi.number(),
    length: Joi.number(),
    height: Joi.number(),
    width: Joi.number(),
  }),
};
const createDiscount = {
  params: Joi.object().keys({
    variation_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    price: Joi.number().required(),
    discount_from: Joi.date().required(),
    discount_to: Joi.date(),
  }),
  query: Joi.object().keys({}),
};
const revokeDiscount = {
  params: Joi.object().keys({
    variation_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};
const findById = {
  params: Joi.object().keys({
    variation_id: Joi.string().required(),
  }),
};

const findAllByProductId = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
};

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

const findAttributeById = {
  params: Joi.object().keys({
    attribute_id: Joi.string().required(),
  }),
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
  create,
  update,
  createDiscount,
  revokeDiscount,
  findById,
  findAllByProductId,

  createAttribute,
  updateAttribute,
  findAttributeById,

  createAttributeSet,
  updateAttributeSet,
  findAttributeSetsByAttributeId,

  createProductAttributes,
  findProductAttributes,
};
