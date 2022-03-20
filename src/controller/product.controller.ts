import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import productService from "../services/product.service";

const create = async (req: Request, res: Response) => {
  const result = await productService.create(req);
  ApiResponse.created(res, { product: result });
};

const update = async (req: Request, res: Response) => {
  const result = await productService.update(req);
  ApiResponse.ok(res, { product: result });
};

const deleteCollection = async (req: Request, res: Response) => {
  const result = await productService.deleteCollection(req);
  ApiResponse.ok(res, result);
};
const deleteCategory = async (req: Request, res: Response) => {
  const result = await productService.deleteCategory(req);
  ApiResponse.ok(res, result);
};
const deleteTag = async (req: Request, res: Response) => {
  const result = await productService.deleteTag(req);
  ApiResponse.ok(res, result);
};

const findById = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await productService.findById(product_id);
  ApiResponse.ok(res, { product: result });
};

const findAll = async (req: Request, res: Response) => {
  const result = await productService.findAll(req);
  ApiResponse.ok(res, result);
};

const findLatestByCollection = async (req: Request, res: Response) => {
  const result = await productService.findLatestByCollection();
  ApiResponse.ok(res, result);
};

const findFlashProducts = async (req: Request, res: Response) => {
  const result = await productService.findFlashProducts(req);
  ApiResponse.ok(res, result);
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
