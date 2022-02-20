import Joi from "joi";

const findById = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
};
const findAllByOrderId = {
  params: Joi.object().keys({
    order_id: Joi.string().required(),
  }),
};

export default {
  findById,
  findAllByOrderId,
};
