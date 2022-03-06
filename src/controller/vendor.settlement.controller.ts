import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import vendorSettlementService from "../services/vendor.settlement.service";

const adminProcessSettlement = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.adminProcessSettlement(req);
  ApiResponse.ok(res, { settlement: result });
};
const findById = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.findById(req);
  ApiResponse.ok(res, result);
};
const findAllByStoreId = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.findAllByStoreId(req);
  ApiResponse.ok(res, { settlements: result });
};

export default { adminProcessSettlement, findById, findAllByStoreId };
