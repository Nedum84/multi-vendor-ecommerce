import { Request } from "express";
import { ErrorResponse } from "../apiresponse/error.response";
import { NotFoundError } from "../apiresponse/not.found.error";
import { TokenTypes } from "../enum/token.enum";
import { Token } from "../models";
import { UserUtils } from "../utils/user.utils";
import tokenService from "./token.service";
import userService from "./user.service";

const login = async (req: Request) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email, true);

  if (!user || !(await UserUtils.isPasswordMatch(password, user.password))) {
    throw new ErrorResponse("Incorrect email or password");
  }
  return user;
};

const logout = async (refreshToken: string) => {
  const refreshTokenDoc = await Token.findOne({
    where: { token: refreshToken, type: TokenTypes.REFRESH },
  });
  if (!refreshTokenDoc) {
    throw new NotFoundError("Token Not found");
  }
  await refreshTokenDoc.destroy();
};

const refreshToken = async (req: Request) => {
  const { refresh_token } = req.body;
  return tokenService.refreshToken(refresh_token);
};

export default { login, logout, refreshToken };
