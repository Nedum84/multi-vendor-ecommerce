import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import userAddressService from "./service";

const create = async (req: Request, res: Response) => {
  const result = await userAddressService.create(req);
  SuccessResponse.created(res, { address: result });
};
const update = async (req: Request, res: Response) => {
  const result = await userAddressService.update(req);
  SuccessResponse.ok(res, { address: result });
};
const findById = async (req: Request, res: Response) => {
  const { address_id } = req.params;
  const result = await userAddressService.findById(address_id);
  SuccessResponse.ok(res, { address: result });
};
const findAllByUserId = async (req: Request, res: Response) => {
  const result = await userAddressService.findAllByUserId(req);
  SuccessResponse.ok(res, { addresses: result });
};

export default {
  create,
  update,
  findById,
  findAllByUserId,
};
