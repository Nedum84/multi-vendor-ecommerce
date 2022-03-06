import { Request, Response } from "express";
import userWalletService from "../services/user.wallet.service";
import { ApiResponse } from "../apiresponse/api.response";

const adminCreateCreditReward = async (req: Request, res: Response) => {
  const result = await userWalletService.adminCreateCreditReward(req);
  ApiResponse.created(res, { credit: result });
};
const userCreateCreditReward = async (req: Request, res: Response) => {
  const result = await userWalletService.userCreateCreditReward(req);
  ApiResponse.created(res, { credit: result });
};
const userRedeemCreditReward = async (req: Request, res: Response) => {
  const result = await userWalletService.userRedeemCreditReward(req);
  ApiResponse.created(res, { credit: result });
};

const getWalletBalance = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await userWalletService.getWalletBalance(user_id);
  ApiResponse.ok(res, { balance: result });
};

const balanceHistory = async (req: Request, res: Response) => {
  const result = await userWalletService.balanceHistory(req);
  ApiResponse.ok(res, { history: result });
};
const withrawableBalance = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await userWalletService.withrawableBalance(user_id);
  ApiResponse.ok(res, result);
};

export default {
  adminCreateCreditReward,
  userCreateCreditReward,
  userRedeemCreditReward,
  getWalletBalance,
  balanceHistory,
  withrawableBalance,
};
