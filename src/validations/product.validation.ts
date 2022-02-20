import Joi from "joi";
import { ProductStatus, StockStatus } from "../enum/product.enum";
import { paginateDefault } from ".";

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    desc: Joi.string().required(),
    images: Joi.array().items(Joi.string().required()).required().min(1),
    status: Joi.string()
      .valid(...Object.values(ProductStatus))
      .default(ProductStatus.PENDING),
    is_featured: Joi.boolean().default(false),
    store_id: Joi.string().required(),

    //Default variationsszz...
    variation: Joi.object().keys({
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
    }),
    //Discountszz
    discount: Joi.object().keys({
      price: Joi.number().required(),
      discount_from: Joi.date().required(),
      discount_to: Joi.date(),
    }),
    //Categoryzz
    category_ids: Joi.array().items(Joi.string().required()).required(),
    //Collectionszz
    collection_ids: Joi.array().items(Joi.string().required()),
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
    category_ids: Joi.array().items(Joi.string().required()),
    collection_ids: Joi.array().items(Joi.string().required()),
    status: Joi.string().valid(...Object.values(ProductStatus)),
    is_featured: Joi.boolean(),
  }),
};
const deleteCollection = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    collection_ids: Joi.array().items(Joi.string().required()).required(),
  }),
};
const deleteCategory = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    category_ids: Joi.array().items(Joi.string().required()).required(),
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
    collection_id: Joi.string(),
    search_query: Joi.string(),
    is_approved: Joi.boolean(),
    is_featured: Joi.boolean(),
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
  deleteCollection,
  deleteCategory,
  findById,
  findAll,
  findLatestByCollection,
};
