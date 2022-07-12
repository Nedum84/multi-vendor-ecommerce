import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import userService from "./service";

const update = async (req: Request, res: Response) => {
  const result = await userService.update(req);
  SuccessResponse.ok(res, { user: result });
};
const adminUpdateUser = async (req: Request, res: Response) => {
  const result = await userService.adminUpdateUser(req);
  SuccessResponse.ok(res, { user: result });
};
const updatePassword = async (req: Request, res: Response) => {
  const { user_id } = req.user!;

  const user = await userService.updatePassword(user_id, req.body);
  SuccessResponse.ok(res, { user });
};
const findById = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const result = await userService.findById(user_id);
  SuccessResponse.ok(res, { user: result });
};
const findMe = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await userService.findMe(user_id);
  SuccessResponse.ok(res, { user: result });
};
const findByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;
  const result = await userService.findByEmail(email);
  SuccessResponse.ok(res, { user: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await userService.findAll(req);
  SuccessResponse.ok(res, { users: result });
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
