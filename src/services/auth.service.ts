import { Request } from "express";
import { ErrorResponse } from "../apiresponse/error.response";
import { NotFoundError } from "../apiresponse/not.found.error";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { TokenTypes } from "../enum/token.enum";
import sequelize, { Token } from "../models";
import { UserUtils } from "../utils/user.utils";
import storeService from "./store.service";
import tokenService from "./token.service";
import userService from "./user.service";

const login = async (req: Request) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);
  if (!user || !(await UserUtils.isPasswordMatch(password, user.password!))) {
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
  try {
    const result = await sequelize.transaction(async (t) => {
      const refreshTokenDoc = await tokenService.verifyToken(refresh_token, TokenTypes.REFRESH);
      const user = await userService.findById(refreshTokenDoc.user_id);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      await refreshTokenDoc.destroy({ transaction: t });

      const stores = await storeService.findUserStores(refreshTokenDoc.user_id, true);
      const store_ids = stores.map((s) => s.store_id);

      return tokenService.generateAuthTokens(user, store_ids, t);
    });
    return result;
  } catch (error) {
    throw new UnauthorizedError(`Please authenticate::Invalid auth token{{${error}}}`);
  }
};

export default { login, logout, refreshToken };
