import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import authService from "./service.auth";
import storeService from "../ec-store/service";
import tokenService from "./service.token";
import userService from "../ec-user/service";

const register = async (req: Request, res: Response) => {
  const user = await userService.create(req);

  const tokens = await tokenService.generateAuthTokens(user, []);
  SuccessResponse.created(res, { user, tokens });
};

const login = async (req: Request, res: Response) => {
  const user = await authService.login(req);

  const stores = await storeService.findUserStores(user.user_id, true);
  const store_ids = stores.map((s) => s.store_id);

  const tokens = await tokenService.generateAuthTokens(user, store_ids);
  SuccessResponse.ok(res, { user, tokens });
};

const logout = async (req: Request, res: Response) => {
  await authService.logout(req.body.refresh_token);
  SuccessResponse.ok(res);
};

const refreshToken = async (req: Request, res: Response) => {
  const tokens = await authService.refreshToken(req);
  SuccessResponse.ok(res, { tokens });
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
