import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import vendorSettlementService from "../services/vendor.settlement.service";
import { Helpers } from "../utils/helpers";

const findById = async (req: Request, res: Response) => {
  const { settlement_id } = req.params;
  const result = await vendorSettlementService.findById(settlement_id);
  ApiResponse.ok(res, result);
};
const findAllByStoreId = async (req: Request, res: Response) => {
  const { store_id } = req.params!;
  const result = await vendorSettlementService.findAllByStoreId(store_id, Helpers.getPaginate(req.query));
  ApiResponse.ok(res, { settlements: result });
};

export default { findById, findAllByStoreId };
