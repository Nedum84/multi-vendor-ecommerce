import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import transactionService from "./service";

const balance = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await transactionService.balance(user_id);
  SuccessResponse.ok(res, { balance: result });
};

const findById = async (req: Request, res: Response) => {
  const { transaction_id } = req.params;
  const result = await transactionService.findById(transaction_id);
  SuccessResponse.ok(res, { transaction: result });
};

const findAll = async (req: Request, res: Response) => {
  const result = await transactionService.findAll(req);
  SuccessResponse.ok(res, result);
};

const adminFindAll = async (req: Request, res: Response) => {
  const result = await transactionService.adminFindAll(req);
  SuccessResponse.ok(res, result);
};

export default {
  balance,
  findById,
  findAll,
  adminFindAll,
};
