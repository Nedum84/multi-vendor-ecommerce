import { name, email, password } from "../ec-joi-schema/custom.validators";
import Joi from "joi";
import { ValidatorInterface } from "../ec-joi-schema/types";

const register: ValidatorInterface = {
  body: Joi.object().keys({
    name: Joi.string().custom(name).required(),
    phone: Joi.string().required(),
    email: Joi.string().custom(email).required(),
    password: Joi.custom(password).required(),
  }),
};
const login: ValidatorInterface = {
  body: Joi.object().keys({
    email: Joi.string().custom(email).required(),
    password: Joi.custom(password).required(),
  }),
};

const refreshToken: ValidatorInterface = {
  body: Joi.object().keys({
    refresh_token: Joi.string().required(),
  }),
};
const logout: ValidatorInterface = {
  body: Joi.object().keys({
    refresh_token: Joi.string().required(),
  }),
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
