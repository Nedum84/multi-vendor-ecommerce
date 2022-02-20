import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import storeService from "../services/store.service";

const create = async (req: Request, res: Response) => {
  const result = await storeService.create(req);
  ApiResponse.created(res, { store: result });
};
const update = async (req: Request, res: Response) => {
  const result = await storeService.update(req);
  ApiResponse.ok(res, { store: result });
};
const adminVerifyStore = async (req: Request, res: Response) => {
  const result = await storeService.adminVerifyStore(req);
  ApiResponse.ok(res, { store: result });
};
const findById = async (req: Request, res: Response) => {
  const { store_id } = req.params;
  const result = await storeService.findById(store_id);
  ApiResponse.ok(res, { store: result });
};
const findUserStores = async (req: Request, res: Response) => {
  const { user_id, verified } = req.query as any;
  const result = await storeService.findUserStores(user_id, verified);
  ApiResponse.ok(res, { stores: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await storeService.findAll(req);
  ApiResponse.ok(res, { stores: result });
};
const storeBalance = async (req: Request, res: Response) => {
  const result = await storeService.storeBalance(req);
  ApiResponse.ok(res, result);
};

export default {
  create,
  update,
  adminVerifyStore,
  findById,
  findUserStores,
  findAll,
  storeBalance,
};
