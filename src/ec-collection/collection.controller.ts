import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import collectionService from "./collection.service";

const create = async (req: Request, res: Response) => {
  const result = await collectionService.create(req);
  SuccessResponse.created(res, { collection: result });
};
const update = async (req: Request, res: Response) => {
  const result = await collectionService.update(req);
  SuccessResponse.ok(res, { collection: result });
};
const findById = async (req: Request, res: Response) => {
  const { collection_id } = req.params;
  const result = await collectionService.findById(collection_id);
  SuccessResponse.ok(res, { collection: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await collectionService.findAll();
  SuccessResponse.ok(res, { collections: result });
};

export default {
  create,
  update,
  findById,
  findAll,
};
