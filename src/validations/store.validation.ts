import Joi from "joi";

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string(),
    logo: Joi.string(),
    address: Joi.string().required(),
    country: Joi.string().required(),
    description: Joi.string(),
  }),
};

const update = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    logo: Joi.string(),
    address: Joi.string(),
    country: Joi.string(),
    description: Joi.string(),
  }),
};

const adminVerifyStore = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
};

const findById = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
};

const findUserStores = {
  params: Joi.object().keys({
    user_id: Joi.string().required(),
    verified: Joi.boolean(),
  }),
};

const findAll = {
  query: Joi.object().keys({
    store_id: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    verified: Joi.boolean(),
    search_query: Joi.string(),
  }),
};

const storeBalance = {
  params: Joi.object().keys({
    store_id: Joi.string().required(),
  }),
};

export default {
  create,
  update,
  adminVerifyStore,
  findById,
  findUserStores,
  findAll,
  storeBalance,
};
