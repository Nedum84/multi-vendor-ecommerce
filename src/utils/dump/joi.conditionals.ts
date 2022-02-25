import Joi from "joi";
import { PaymentChannel, PaymentStatus } from "../../enum/payment.enum";

const schema1 = {
  params: Joi.object().keys({}),
  body: Joi.object().keys({
    x: Joi.string().valid("1", "2").required(),
    y: Joi.string().valid("2", "3").required(),
    c: Joi.string()
      .when("x", {
        is: "1",
        then: Joi.when("y", {
          is: "2",
          then: Joi.string().required(),
        }),
      })
      .when("x", {
        is: "1",
        then: Joi.when("y", {
          is: "3",
          then: Joi.string().required(),
        }),
      }),
  }),
};
const schema2 = Joi.object({
  payed_from_wallet: Joi.boolean().required(),
  order_id: Joi.string().required(),
})
  .when(Joi.object({ payed_from_wallet: Joi.boolean().valid(true) }).unknown(), {
    then: Joi.object({}),
  })
  .when(Joi.object({ payed_from_wallet: Joi.boolean().valid(false) }).unknown(), {
    then: Joi.object({
      payment_id: Joi.string().required(),
      payment_status: Joi.string()
        .required()
        .valid(...Object.values(PaymentStatus)),
      payment_channel: Joi.string()
        .required()
        .valid(...Object.values(PaymentChannel)),
    }),
  });
//--> schema2 === schema4
const schema4 = Joi.object({
  payed_from_wallet: Joi.boolean().required(),
  order_id: Joi.string().required(),
})
  .when("payed_from_wallet", {
    is: true,
    then: Joi.object({}),
  })
  .when("payed_from_wallet", {
    is: false,
    then: Joi.object({
      payment_id: Joi.string().required(),
      payment_status: Joi.string()
        .required()
        .valid(...Object.values(PaymentStatus)),
      payment_channel: Joi.string()
        .required()
        .valid(...Object.values(PaymentChannel)),
    }),
  });

const schema3 = Joi.object({
  payed_from_wallet: Joi.boolean().required(),
  order_id: Joi.string().required(),
  payment_id: Joi.alternatives().conditional("payed_from_wallet", {
    is: false,
    then: Joi.string().required(),
  }),
  payment_status: Joi.alternatives().conditional("payed_from_wallet", {
    is: false,
    then: Joi.string()
      .required()
      .valid(...Object.values(PaymentStatus)),
  }),
  payment_channel: Joi.alternatives().conditional("payed_from_wallet", {
    is: false,
    then: Joi.string()
      .required()
      .valid(...Object.values(PaymentChannel)),
  }),
});
