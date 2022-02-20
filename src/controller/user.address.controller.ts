import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import userAddressService from "../services/user.address.service";

const create = async (req: Request, res: Response) => {
  const result = await userAddressService.create(req);
  ApiResponse.created(res, { address: result });
};
const update = async (req: Request, res: Response) => {
  const result = await userAddressService.update(req);
  ApiResponse.ok(res, { address: result });
};
const findById = async (req: Request, res: Response) => {
  const { address_id } = req.params;
  const result = await userAddressService.findById(address_id);
  ApiResponse.ok(res, { address: result });
};
const findAllByUserId = async (req: Request, res: Response) => {
  const result = await userAddressService.findAllByUserId(req);
  ApiResponse.ok(res, { addresses: result });
};

export default {
  create,
  update,
  findById,
  findAllByUserId,
};
