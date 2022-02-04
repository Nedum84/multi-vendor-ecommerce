import { name, email, password, ValidatorInterface } from ".";
import Joi from "joi";

const register: ValidatorInterface = {
  body: Joi.object().keys({
    name: Joi.string().custom(name).required(),
    phone: Joi.string().required().required(),
    email: Joi.string().custom(email).required(),
    password: Joi.number().custom(password).required(),
  }),
};
const login: ValidatorInterface = {
  body: Joi.object().keys({
    email: Joi.string().custom(email).required(),
    password: Joi.number().custom(password).required(),
  }),
};

const refreshToken: ValidatorInterface = {
  body: Joi.object().keys({
    refresh_token: Joi.string().required(),
  }),
};
const logout: ValidatorInterface = {
  body: Joi.object().keys({}),
  params: Joi.object().keys({}),
  query: Joi.object().keys({}),
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
