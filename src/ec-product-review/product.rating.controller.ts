import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import productRatingService from "./product.rating.service";

const create = async (req: Request, res: Response) => {
  const result = await productRatingService.create(req);
  SuccessResponse.created(res, { rating: result });
};
const update = async (req: Request, res: Response) => {
  const result = await productRatingService.update(req);
  SuccessResponse.ok(res, { rating: result });
};
const checkRated = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const { product_id } = req.params;
  const result = await productRatingService.checkRated(user_id, product_id);
  SuccessResponse.ok(res, { rating: result });
};
const findByProductId = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await productRatingService.findByProductId(product_id);
  SuccessResponse.ok(res, result);
};
const findByStoreId = async (req: Request, res: Response) => {
  const { store_id } = req.params;
  const result = await productRatingService.findByStoreId(store_id);
  SuccessResponse.ok(res, result);
};

export default {
  create,
  update,
  checkRated,
  findByProductId,
  findByStoreId,
};
