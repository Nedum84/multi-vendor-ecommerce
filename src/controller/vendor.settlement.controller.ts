import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import vendorSettlementService from "../services/vendor.settlement.service";

const findById = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.findById(req);
  ApiResponse.ok(res, result);
};
const findAllByStoreId = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.findAllByStoreId(req);
  ApiResponse.ok(res, { settlements: result });
};

export default { findById, findAllByStoreId };
