import Joi from "joi";

const create = {
  body: Joi.object().keys({
    product_id: Joi.string().required(),
  }),
};

const findAllForUser = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys(),
};

export default { create, findAllForUser };
