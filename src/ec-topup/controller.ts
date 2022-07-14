import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { TopupAttributes } from "./model";
import topupService from "./service";
import { PaymentChannel } from "./types";
import { isAdmin } from "../ec-apps/app-admin/roles.service";

const topUserAccount = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const body: Omit<TopupAttributes, "topup_id"> = req.body;
  body.user_id = user_id;
  body.action_performed_by = user_id;

  if (body.payment_channel === PaymentChannel.FLW) {
    // TODO: verify transanction ref
  }
  if (body.payment_channel === PaymentChannel.PAYPAL) {
    // TODO: verify transanction ref
  }
  if (body.payment_channel === PaymentChannel.PAYSTACK) {
    // TODO: verify transanction ref
  }
  if (body.payment_channel === PaymentChannel.SQUAD) {
    // TODO: verify transanction ref
  }
  const checkAdded = await topupService.findByPaymentRef(body.payment_reference);
  if (checkAdded) {
    return SuccessResponse.ok(res, { topup: checkAdded });
  }

  const result = await topupService.topUserAccount(body);
  SuccessResponse.ok(res, { topup: result });
};
const findById = async (req: Request, res: Response) => {
  const { topup_id } = req.params;
  const { role, user_id } = req.user!;
  const result = await topupService.findById(topup_id);

  if (result.user_id !== user_id && !isAdmin(role)) {
    throw new ForbiddenError();
  }
  SuccessResponse.ok(res, { topup: result });
};
const findAllUser = async (req: Request, res: Response) => {
  const result = await topupService.findAllUser(req);
  SuccessResponse.ok(res, result);
};
const findAllAdmin = async (req: Request, res: Response) => {
  const result = await topupService.findAllAdmin(req);
  SuccessResponse.ok(res, result);
};

export default {
  topUserAccount,
  findById,
  findAllUser,
  findAllAdmin,
};
