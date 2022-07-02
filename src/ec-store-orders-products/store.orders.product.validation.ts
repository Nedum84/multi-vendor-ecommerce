import Joi from "joi";

const findAllBySubOrderId = {
  params: Joi.object().keys({
    store_order_id: Joi.string().required(),
  }),
};

export default {
  findAllBySubOrderId,
};
