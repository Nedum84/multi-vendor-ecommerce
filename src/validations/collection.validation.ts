import Joi from "joi";
import { CollectStatus } from "../enum/collection.enum";

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    image: Joi.string(),
    status: Joi.string().valid(...Object.values(CollectStatus)),
  }),
};
const update = {
  params: Joi.object().keys({
    collection_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    image: Joi.string(),
    status: Joi.string().valid(...Object.values(CollectStatus)),
  }),
};
const findById = {
  params: Joi.object().keys({
    collection_id: Joi.string().required(),
  }),
};
const findAll = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
};
const createProduct = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    collection_id: Joi.string().required(),
  }),
};
const deleteProduct = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
    collection_id: Joi.string().required(),
  }),
};

export default {
  create,
  update,
  findById,
  findAll,
  createProduct,
  deleteProduct,
};
