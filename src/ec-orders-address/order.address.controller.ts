import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import orderAddressService from "./order.address.service";

const findAll = async (req: Request, res: Response) => {
  const result = await orderAddressService.findAll(req);
  SuccessResponse.ok(res, { addresses: result });
};

export default {
  findAll,
};
