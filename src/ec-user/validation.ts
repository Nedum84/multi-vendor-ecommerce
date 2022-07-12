import Joi from "joi";
import { password, email, name } from "../ec-joi-schema/custom.validators";
import { UserRoleStatus } from "./types";

const update = {
  body: Joi.object()
    .keys({
      name: Joi.string().custom(name),
      phone: Joi.string(),
      email: Joi.string().custom(email),
      photo: Joi.string(),
      bank_details: Joi.object({
        acc_name: Joi.string().required(),
        acc_number: Joi.string().required(),
        bank_code: Joi.string().required(),
        bank_name: Joi.string().required(),
      }),
    })
    .min(1),
};

const adminUpdateUser = {
  params: Joi.object().keys({
    user_id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().custom(name),
      phone: Joi.string(),
      email: Joi.string().custom(email),
      photo: Joi.string(),
      role: Joi.string().valid(...Object.values(UserRoleStatus)),
      suspended: Joi.boolean(),
      bank_details: Joi.object({
        acc_name: Joi.string().required(),
        acc_number: Joi.string().required(),
        bank_code: Joi.string().required(),
        bank_name: Joi.string().required(),
      }),
    })
    .min(1),
};

const updatePassword = {
  body: Joi.object()
    .keys({
      new_password: Joi.string().required().custom(password),
      old_password: Joi.string().required(),
    })
    .min(1),
};

const findById = {
  params: Joi.object().keys({
    user_id: Joi.string().required(),
  }),
};

const findMe = {
  params: Joi.object().keys({}),
};

const findByEmail = {
  params: Joi.object().keys({
    email: Joi.string().required(),
  }),
};

const findAll = {
  params: Joi.object().keys({
    user_id: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    suspended: Joi.boolean(),
    search_query: Joi.string(),
  }),
};

export default {
  update,
  adminUpdateUser,
  updatePassword,
  findById,
  findMe,
  findByEmail,
  findAll,
};
