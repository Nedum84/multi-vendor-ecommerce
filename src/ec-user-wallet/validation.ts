import Joi from "joi";

const balance = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({}),
  query: Joi.object().keys({}),
};

export default { balance };
