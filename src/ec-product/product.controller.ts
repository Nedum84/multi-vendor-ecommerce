import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import productService from "./product.service";

const create = async (req: Request, res: Response) => {
  const result = await productService.create(req);
  SuccessResponse.created(res, { product: result });
};

const update = async (req: Request, res: Response) => {
  const result = await productService.update(req);
  SuccessResponse.ok(res, { product: result });
};

const deleteCollection = async (req: Request, res: Response) => {
  const result = await productService.deleteCollection(req);
  SuccessResponse.ok(res, result);
};
const deleteCategory = async (req: Request, res: Response) => {
  const result = await productService.deleteCategory(req);
  SuccessResponse.ok(res, result);
};
const deleteTag = async (req: Request, res: Response) => {
  const result = await productService.deleteTag(req);
  SuccessResponse.ok(res, result);
};

const findById = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await productService.findById(product_id);
  SuccessResponse.ok(res, { product: result });
};

const findAll = async (req: Request, res: Response) => {
  const result = await productService.findAll(req);
  SuccessResponse.ok(res, result);
};

const findLatestByCollection = async (req: Request, res: Response) => {
  const result = await productService.findLatestByCollection();
  SuccessResponse.ok(res, result);
};

const findFlashProducts = async (req: Request, res: Response) => {
  const result = await productService.findFlashProducts(req);
  SuccessResponse.ok(res, result);
};

export default {
  create,
  update,
  deleteCollection,
  deleteCategory,
  deleteTag,
  findById,
  findAll,
  findLatestByCollection,
  findFlashProducts,
};
