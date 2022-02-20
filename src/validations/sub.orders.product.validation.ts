import Joi from "joi";

const findAllBySubOrderId = {
  params: Joi.object().keys({
    sub_order_id: Joi.string().required(),
  }),
};

export default {
  findAllBySubOrderId,
};
