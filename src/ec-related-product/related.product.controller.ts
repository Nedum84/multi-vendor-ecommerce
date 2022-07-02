import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import relatedProductService from "./related.product.service";

const create = async (req: Request, res: Response) => {
  const result = await relatedProductService.create(req);
  SuccessResponse.ok(res, result);
};
const remove = async (req: Request, res: Response) => {
  const result = await relatedProductService.remove(req);
  SuccessResponse.ok(res, result);
};
const findForProduct = async (req: Request, res: Response) => {
  const result = await relatedProductService.findForProduct(req);
  SuccessResponse.ok(res, { products: result });
};

export default {
  create,
  remove,
  findForProduct,
};
