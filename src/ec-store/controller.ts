import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import storeService from "./service";

const create = async (req: Request, res: Response) => {
  const result = await storeService.create(req);
  SuccessResponse.created(res, { store: result });
};
const update = async (req: Request, res: Response) => {
  const result = await storeService.update(req);
  SuccessResponse.ok(res, { store: result });
};
const adminVerifyStore = async (req: Request, res: Response) => {
  const result = await storeService.adminVerifyStore(req);
  SuccessResponse.ok(res, { store: result });
};
const adminUpdateStore = async (req: Request, res: Response) => {
  const result = await storeService.adminUpdateStore(req);
  SuccessResponse.ok(res, { store: result });
};
const findById = async (req: Request, res: Response) => {
  const { store_id } = req.params;
  const result = await storeService.findById(store_id);
  SuccessResponse.ok(res, { store: result });
};
const findUserStores = async (req: Request, res: Response) => {
  const { user_id, verified } = req.query as any;
  const result = await storeService.findUserStores(user_id, verified);
  SuccessResponse.ok(res, { stores: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await storeService.findAll(req);
  SuccessResponse.ok(res, { stores: result });
};
const storeBalance = async (req: Request, res: Response) => {
  const result = await storeService.storeBalance(req);
  SuccessResponse.ok(res, result);
};

export default {
  create,
  update,
  adminVerifyStore,
  adminUpdateStore,
  findById,
  findUserStores,
  findAll,
  storeBalance,
};
