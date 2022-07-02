import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import creditCodeService from "./credit.code.service";

const create = async (req: Request, res: Response) => {
  const result = await creditCodeService.create(req);
  SuccessResponse.created(res, { credit_code: result });
};
const generateCreditCode = async (req: Request, res: Response) => {
  const result = await creditCodeService.generateCreditCode();
  SuccessResponse.ok(res, { credit_code: result });
};
const revokeCreditCode = async (req: Request, res: Response) => {
  const result = await creditCodeService.revokeCreditCode(req);
  SuccessResponse.ok(res, { credit_code: result });
};
const validateCreditCodeExist = async (req: Request, res: Response) => {
  const { credit_code } = req.body;
  const result = await creditCodeService.validateCreditCodeExist(credit_code);
  SuccessResponse.ok(res, result);
};
const findByCreditCodeCode = async (req: Request, res: Response) => {
  const { credit_code } = req.params;
  const result = await creditCodeService.findByCreditCodeCode(credit_code);
  SuccessResponse.ok(res, { credit_code: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await creditCodeService.findAll(req);
  SuccessResponse.ok(res, { credit_codes: result });
};

export default {
  create,
  generateCreditCode,
  revokeCreditCode,
  validateCreditCodeExist,
  findByCreditCodeCode,
  findAll,
};
