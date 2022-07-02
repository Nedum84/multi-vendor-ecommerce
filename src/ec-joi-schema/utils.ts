import Joi from "joi";

export const paginateDefault = {
  perPage: Joi.number().default(10).max(1000),
  page: Joi.number().min(1).max(500).default(1),
};
