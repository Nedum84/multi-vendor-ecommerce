import Joi from "joi";
import { StockStatus } from "../ec-product/types";

const create = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    sku: Joi.string(),
    price: Joi.number().required(),
    with_storehouse_management: Joi.boolean().default(true),
    stock_status: Joi.string()
      .valid(...Object.values(StockStatus))
      .default(StockStatus.IN_STOCK),
    stock_qty: Joi.number(),
    max_purchase_qty: Joi.number(),
    weight: Joi.number(),
    length: Joi.number(),
    height: Joi.number(),
    width: Joi.number(),
    //attr set ids
    attribute_set_ids: Joi.array().items(Joi.string().required()).default([]),
    //Discountszz
    discount: Joi.object().keys({
      price: Joi.number().required(),
      discount_from: Joi.date().required(),
      discount_to: Joi.date(),
    }),
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
    max_purchase_qty: Joi.number(),
    weight: Joi.number(),
    length: Joi.number(),
    height: Joi.number(),
    width: Joi.number(),
    //attr set ids
    attribute_set_ids: Joi.array().items(Joi.string().required()).default([]),
    //Discountszz
    discount: Joi.object().keys({
      price: Joi.number().required(),
      discount_from: Joi.date().required(),
      discount_to: Joi.date(),
    }),
  }),
};

const deleteVariation = {
  params: Joi.object().keys({
    variation_id: Joi.string().required(),
  }),
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

export default {
  create,
  update,
  deleteVariation,
  findById,
  findAllByProductId,
};
