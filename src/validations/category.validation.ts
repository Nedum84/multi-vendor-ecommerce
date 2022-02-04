import Joi from "joi";
import { paginateDefault } from ".";

const create = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    parent_id: Joi.string(),
    name: Joi.string().required(),
    desc: Joi.string(),
    icon: Joi.string(),
    active: Joi.boolean(),
  }),
};

const update = {
  params: Joi.object().keys({
    category_id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      parent_id: Joi.string(),
      name: Joi.string(),
      desc: Joi.string(),
      icon: Joi.string(),
      active: Joi.boolean(),
    })
    .min(1),
};
const findById = {
  params: Joi.object().keys({
    category_id: Joi.string().required(),
  }),
  query: Joi.object().keys({}),
  body: Joi.object().keys({}),
};
const findParents = {
  query: Joi.object().keys({
    category_id: Joi.string().required(),
    direction: Joi.string().valid("top_to_bottom", "bottom_to_top"),
  }),
  body: Joi.object().keys({}),
  params: Joi.object().keys({}),
};
const findChildren = {
  query: Joi.object().keys({
    category_id: Joi.string().required(),
    direction: Joi.string().valid("top_to_bottom", "bottom_to_top"),
  }),
  body: Joi.object().keys({}),
  params: Joi.object().keys({}),
};

const findCategories = {
  params: Joi.object().keys({}),
  query: Joi.object().keys({
    parent_id: Joi.string(),
    ...paginateDefault,
  }),
  body: Joi.object().keys({}),
};
export default {
  create,
  update,
  findParents,
  findChildren,
  findById,
  findCategories,
};
