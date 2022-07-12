import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import withdrawalService from "./service";

const withdraw = async (req: Request, res: Response) => {
  const result = await withdrawalService.withdraw(req);
  SuccessResponse.created(res, { withdrawal: result });
};
const adminProcessWithdrawal = async (req: Request, res: Response) => {
  const result = await withdrawalService.adminProcessWithdrawal(req);
  SuccessResponse.ok(res, { withdrawal: result });
};
const adminDeclineWithdrawal = async (req: Request, res: Response) => {
  const result = await withdrawalService.adminDeclineWithdrawal(req);
  SuccessResponse.ok(res, { withdrawal: result });
};

const findForUser = async (req: Request, res: Response) => {
  const result = await withdrawalService.findForUser(req);
  SuccessResponse.ok(res, { withdrawal: result });
};
const adminFindAll = async (req: Request, res: Response) => {
  const result = await withdrawalService.adminFindAll(req);
  SuccessResponse.ok(res, { withdrawals: result });
};

export default {
  withdraw,
  adminProcessWithdrawal,
  adminDeclineWithdrawal,
  findForUser,
  adminFindAll,
};
