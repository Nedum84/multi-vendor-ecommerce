import { Request } from "express";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { TokenTypes } from "./types";
import { Token } from "../ec-models";
import tokenService from "./service.token";
import userService from "../ec-user/service";
import { isPasswordMatch } from "../ec-user/utils";

const login = async (req: Request) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email, true);

  if (!user || !(await isPasswordMatch(password, user.password))) {
    throw new BadRequestError("Incorrect email or password");
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
