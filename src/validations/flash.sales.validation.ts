import Joi from "joi";

const createFlashSale = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
  }),
};
const updateFlashSale = {
  params: Joi.object().keys({
    flash_sale_id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    start_date: Joi.date(),
    end_date: Joi.date(),
  }),
};
const revokeFlashSale = {
  params: Joi.object().keys({
    flash_sale_id: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};
const findById = {
  params: Joi.object().keys({
    flash_sale_id: Joi.string().required(),
  }),
};
const findAll = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
};
const upsertFlashSaleProducts = {
  params: Joi.object().keys({
    flash_sale_id: Joi.string().required(),
  }),
  body: Joi.array()
    .items(
      Joi.object().keys({
        variation_id: Joi.string().required(),
        price: Joi.number().required(),
        qty: Joi.number().required(),
      })
    )
    .min(2),
};
const removeFlashSaleProduct = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    variation_id: Joi.string().required(),
    flash_sale_id: Joi.string().required(),
  }),
};
const findFlashProduct = {
  query: Joi.object().keys({}),
  params: Joi.object().keys({
    flash_sale_id: Joi.string().required(),
  }),
};

export default {
  createFlashSale,
  updateFlashSale,
  revokeFlashSale,
  findById,
  findAll,
  upsertFlashSaleProducts,
  removeFlashSaleProduct,
  findFlashProduct,
};
