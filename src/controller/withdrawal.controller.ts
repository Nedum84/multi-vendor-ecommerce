import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import withdrawalService from "../services/withdrawal.service";

const withdraw = async (req: Request, res: Response) => {
  const result = await withdrawalService.withdraw(req);
  ApiResponse.created(res, { withdrawal: result });
};
const adminProcessWithdrawal = async (req: Request, res: Response) => {
  const result = await withdrawalService.adminProcessWithdrawal(req);
  ApiResponse.ok(res, { withdrawal: result });
};
const adminDeclineWithdrawal = async (req: Request, res: Response) => {
  const result = await withdrawalService.adminDeclineWithdrawal(req);
  ApiResponse.ok(res, { withdrawal: result });
};

const findForUser = async (req: Request, res: Response) => {
  const result = await withdrawalService.findForUser(req);
  ApiResponse.ok(res, { withdrawal: result });
};
const adminFindAll = async (req: Request, res: Response) => {
  const result = await withdrawalService.adminFindAll(req);
  ApiResponse.ok(res, { withdrawals: result });
};

export default {
  withdraw,
  adminProcessWithdrawal,
  adminDeclineWithdrawal,
  findForUser,
  adminFindAll,
};
