import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import cartService from "./service";

const create = async (req: Request, res: Response) => {
  const result = await cartService.create(req);

  SuccessResponse.ok(res, result);
};
const update = async (req: Request, res: Response) => {
  const result = await cartService.update(req);

  SuccessResponse.ok(res, result);
};
const clearCart = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const { variation_id } = req.body;
  const result = await cartService.clearCart(user_id, variation_id);

  SuccessResponse.ok(res, result);
};
const findAllByUserId = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await cartService.findAllByUserId(user_id);

  SuccessResponse.ok(res, result);
};

export default {
  create,
  update,
  clearCart,
  findAllByUserId,
};
