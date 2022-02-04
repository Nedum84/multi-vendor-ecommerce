import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import collectionService from "../services/collection.service";

const create = async (req: Request, res: Response) => {
  const result = await collectionService.create(req);
  ApiResponse.created(res, { collection: result });
};
const update = async (req: Request, res: Response) => {
  const result = await collectionService.update(req);
  ApiResponse.ok(res, { collection: result });
};
const findbyId = async (req: Request, res: Response) => {
  const { collection_id } = req.params;
  const result = await collectionService.findById(collection_id);
  ApiResponse.ok(res, { collection: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await collectionService.findAll();
  ApiResponse.ok(res, { collection: result });
};

const createProduct = async (req: Request, res: Response) => {
  const { product_id, collection_id } = req.body;
  const result = await collectionService.createProduct(product_id, collection_id);
  ApiResponse.ok(res, { collection_product: result });
};
const deleteProduct = async (req: Request, res: Response) => {
  const { product_id, collection_id } = req.body;
  const result = await collectionService.deleteProduct(product_id, collection_id);
  ApiResponse.ok(res, result);
};

export default {
  create,
  update,
  findbyId,
  findAll,
  createProduct,
  deleteProduct,
};
