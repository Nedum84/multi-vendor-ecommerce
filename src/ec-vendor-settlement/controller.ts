import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import vendorSettlementService from "./service";

const adminProcessSettlement = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.adminProcessSettlement(req);
  SuccessResponse.ok(res, { settlement: result });
};
const findById = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.findById(req);
  SuccessResponse.ok(res, result);
};
const findAllByStoreId = async (req: Request, res: Response) => {
  const result = await vendorSettlementService.findAllByStoreId(req);
  SuccessResponse.ok(res, { settlements: result });
};

export default { adminProcessSettlement, findById, findAllByStoreId };
