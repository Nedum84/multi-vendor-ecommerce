import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import authService from "../services/auth.service";
import storeService from "../services/store.service";
import tokenService from "../services/token.service";
import userService from "../services/user.service";

const register = async (req: Request, res: Response) => {
  const user = await userService.create(req.body);

  const tokens = await tokenService.generateAuthTokens(user, []);
  ApiResponse.created(res, { user, tokens });
};

const login = async (req: Request, res: Response) => {
  const user = await authService.login(req);

  const stores = await storeService.findUserStores(user.user_id, true);
  const store_ids = stores.map((s) => s.store_id);

  const tokens = await tokenService.generateAuthTokens(user, store_ids);
  ApiResponse.created(res, { user, tokens });
};

const logout = async (req: Request, res: Response) => {
  await authService.logout(req.body.refresh_token);
  ApiResponse.ok(res);
};

const refreshToken = async (req: Request, res: Response) => {
  const tokens = await authService.refreshToken(req);
  ApiResponse.ok(res, { tokens });
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
