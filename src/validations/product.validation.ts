import Joi from "joi";
import { ProductStatus, StockStatus } from "../enum/product.enum";
import { paginateDefault } from ".";

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    desc: Joi.string().required(),
    images: Joi.array().items(Joi.string().required()).required(),
    category_id: Joi.string().required(),
    status: Joi.string()
      .valid(...Object.values(ProductStatus))
      .default(ProductStatus.PENDING),
    max_purchase_qty: Joi.number(),
    is_featured: Joi.boolean().default(true),
    store_id: Joi.string().required(),

    //Default variationsszz...
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
    //Discountszz
    discount: Joi.object().keys({
      price: Joi.number().required(),
      discount_from: Joi.date().required(),
      discount_to: Joi.date(),
    }),
    //Collectionszz
    collection_id: Joi.string(),
  }),
};
const update = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    desc: Joi.string(),
    images: Joi.array().items(Joi.string().required()),
    category_id: Joi.string(),
    status: Joi.string().valid(...Object.values(ProductStatus)),
    max_purchase_qty: Joi.number(),
    is_featured: Joi.boolean(),
  }),
};
const findById = {
  params: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
};
const findAll = {
  query: Joi.object().keys({
    store_id: Joi.string(),
    category_id: Joi.string(),
    search_query: Joi.string(),
    is_approved: Joi.boolean(),
    ...paginateDefault,
  }),
};
const findAllByCollectionId = {
  params: Joi.object().keys({
    collection_id: Joi.string().required(),
  }),
  query: Joi.object().keys({
    ...paginateDefault,
  }),
};
const findLatestByCollection = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({ ...paginateDefault }),
};

export default {
  create,
  update,
  findById,
  findAll,
  findAllByCollectionId,
  findLatestByCollection,
};
