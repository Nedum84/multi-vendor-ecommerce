import { Withdrawal } from "../models";
import { Request } from "express";
import { Helpers } from "../utils/helpers";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { isAdmin } from "../utils/admin.utils";
import { createModel } from "../utils/random.string";
import { WithdrawalInstance } from "../models/withdrawal.model";
import { NotFoundError } from "../apiresponse/not.found.error";
import userWalletService from "./user.wallet.service";
import { ErrorResponse } from "../apiresponse/error.response";
import { Op } from "sequelize";

const withdraw = async (req: Request) => {
  const { user_id } = req.user!;
  const { amount }: { amount: number } = req.body;

  const isWithdrawalOpen = await Withdrawal.findAll({
    where: { user_id, [Op.or]: [{ processed: false }, { is_declined: false }] },
  });
  if (isWithdrawalOpen) {
    throw new NotFoundError("You already have a pending withdral awaiting processing");
  }

  const { withrawable_amount } = await userWalletService.withrawableBalance(user_id);

  if (amount > withrawable_amount) {
    throw new ErrorResponse("Withdrawable amount must not be higher than " + withrawable_amount);
  }

  const charges = amount * 0.01;
  const amount_user_will_receive = amount - charges;
  return createModel<WithdrawalInstance>(
    Withdrawal,
    { amount, amount_user_will_receive, charges, user_id },
    "withdrawal_id"
  );
};

const adminProcessWithdrawal = async (req: Request) => {
  const { role } = req.user!;
  const { withdrawal_id } = req.params;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }
  const withdrawal = await Withdrawal.findByPk(withdrawal_id);
  if (!withdrawal) {
    throw new NotFoundError("Withdrawal not found");
  }
  if (withdrawal.is_declined) {
    throw new ErrorResponse("Withdrawal already declined");
  }

  //Do any withdrawal task
  ///
  ///

  withdrawal.processed = true;
  withdrawal.processed_at = new Date();
  await withdrawal.save();

  return withdrawal;
};
const adminDeclineWithdrawal = async (req: Request) => {
  const { role } = req.user!;
  const { withdrawal_id } = req.params;
  const { declined_reason } = req.body;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }
  const withdrawal = await Withdrawal.findByPk(withdrawal_id);
  if (!withdrawal) {
    throw new NotFoundError("Withdrawal not found");
  }
  if (withdrawal.is_declined) {
    throw new NotFoundError("Withdrawal already declined");
  }

  withdrawal.is_declined = true;
  withdrawal.declined_reason = declined_reason;
  await withdrawal.save();

  return withdrawal;
};
const findForUser = async (req: Request) => {
  const { user_id } = req.user!;
  const { processed } = req.query as any;
  const { limit, offset } = Helpers.getPaginate(req.query);

  return Withdrawal.findAll({
    where: { user_id, ...(processed ? { processed: processed } : {}) },
    limit,
    offset,
  });
};
const adminFindAll = async (req: Request) => {
  const { role } = req.user!;
  const { processed, user_id, is_declined } = req.query as any;
  const { limit, offset } = Helpers.getPaginate(req.query);
  const where: { [k: string]: any } = {};

  if (user_id) {
    where.user_id = user_id;
  }
  if (is_declined) {
    where.is_declined = is_declined;
  }
  if (processed) {
    where.processed = processed;
  }
  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  return Withdrawal.findAll({ where, limit, offset });
};

export default {
  withdraw,
  adminProcessWithdrawal,
  adminDeclineWithdrawal,
  findForUser,
  adminFindAll,
};
