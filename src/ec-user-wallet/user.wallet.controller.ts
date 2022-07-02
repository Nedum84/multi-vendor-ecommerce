import { Request, Response } from "express";
import userWalletService from "./user.wallet.service";
import { SuccessResponse } from "../ec-api-response/success.response";

const adminCreateCreditReward = async (req: Request, res: Response) => {
  const result = await userWalletService.adminCreateCreditReward(req);
  SuccessResponse.created(res, { credit: result });
};
const userCreateCreditReward = async (req: Request, res: Response) => {
  const result = await userWalletService.userCreateCreditReward(req);
  SuccessResponse.created(res, { credit: result });
};
const userRedeemCreditReward = async (req: Request, res: Response) => {
  const result = await userWalletService.userRedeemCreditReward(req);
  SuccessResponse.created(res, { credit: result });
};

const getWalletBalance = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await userWalletService.getWalletBalance(user_id);
  SuccessResponse.ok(res, { balance: result });
};

const balanceHistory = async (req: Request, res: Response) => {
  const result = await userWalletService.balanceHistory(req);
  SuccessResponse.ok(res, { history: result });
};
const withrawableBalance = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await userWalletService.withrawableBalance(user_id);
  SuccessResponse.ok(res, result);
};

export default {
  adminCreateCreditReward,
  userCreateCreditReward,
  userRedeemCreditReward,
  getWalletBalance,
  balanceHistory,
  withrawableBalance,
};
