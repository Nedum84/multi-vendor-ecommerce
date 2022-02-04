import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import orderAddressService from "../services/order.address.service";

const findAll = async (req: Request, res: Response) => {
  const result = await orderAddressService.findAll(req);
  ApiResponse.ok(res, { product_chat: result });
};

export default {
  findAll,
};
