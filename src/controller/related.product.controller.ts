import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import relatedProductService from "../services/related.product.service";

const create = async (req: Request, res: Response) => {
  const result = await relatedProductService.create(req);
  ApiResponse.ok(res, result);
};
const remove = async (req: Request, res: Response) => {
  const result = await relatedProductService.remove(req);
  ApiResponse.ok(res, result);
};
const findForProduct = async (req: Request, res: Response) => {
  const result = await relatedProductService.findForProduct(req);
  ApiResponse.ok(res, { products: result });
};

export default {
  create,
  remove,
  findForProduct,
};
