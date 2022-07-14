import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import userWalletService from "./service";

const balance = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const result = await userWalletService.balance(user_id);
  SuccessResponse.ok(res, { balance: result });
};

export default { balance };
