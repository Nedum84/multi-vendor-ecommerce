import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import cartService from "../services/cart.service";

const create = async (req: Request, res: Response) => {
  const result = await cartService.create(req);

  ApiResponse.created(res, result);
};
const update = async (req: Request, res: Response) => {
  const result = await cartService.update(req);

  ApiResponse.ok(res, result);
};
const clearCart = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const { variation_id } = req.body;
  const result = await cartService.clearCart(user_id, variation_id);

  ApiResponse.ok(res, result);
};
const findAllByUserId = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await cartService.findAllByUserId(user_id);

  ApiResponse.ok(res, result);
};

export default {
  create,
  update,
  clearCart,
  findAllByUserId,
};
