import sequelize, { Withdrawal } from "../ec-models";
import { Request } from "express";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { WithdrawalAttributes, WithdrawalInstance } from "./model";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import transactionService from "../ec-transaction/service";
import { WithdrawalMeans } from "./types";
import { TransactionOperation } from "../ec-transaction/types";
import userWalletService from "../ec-user-wallet/service";
import { WhereFilters } from "../ec-models/types";
import { createModel, getPaginate } from "../ec-models/utils";
import { isAdmin } from "../ec-apps/app-admin/roles.service";

const withdraw = async (req: Request) => {
  const { user_id } = req.user!;
  const { amount }: { amount: number } = req.body;

  const isWithdrawalOpen = await Withdrawal.findOne({
    where: { user_id, processed: false, is_declined: false },
  });

  if (isWithdrawalOpen) {
    throw new NotFoundError("You already have a pending withdral awaiting processing");
  }

  const balance = await userWalletService.balance(user_id);

  if (amount > balance) {
    throw new BadRequestError("Withdrawable amount must not be higher than " + balance);
  }

  const transaction_fee = amount * 0.01;
  const user_amount = amount - transaction_fee;
  return createModel<WithdrawalInstance, WithdrawalAttributes>(
    Withdrawal,
    {
      amount,
      user_amount,
      transaction_fee,
      user_id,
      withdrawal_means: WithdrawalMeans.BANK_DETAIL_NG,
    },
    "withdrawal_id"
  );
};

const adminProcessWithdrawal = async (req: Request) => {
  const { role } = req.user!;
  const { withdrawal_id } = req.params;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }
  const withdrawal = await Withdrawal.findByPk(withdrawal_id);
  if (!withdrawal) {
    throw new NotFoundError("Withdrawal not found");
  }
  if (withdrawal.is_declined) {
    throw new BadRequestError("Withdrawal already declined");
  }

  //Do any withdrawal task
  ///
  ///
  try {
    return sequelize.transaction(async function (transaction) {
      withdrawal.processed = true;
      withdrawal.processed_at = new Date();
      await withdrawal.save();

      // Log detail to transaction table
      await transactionService.create(
        {
          amount: withdrawal.amount,
          desc: `Wallet topup`,
          operation: TransactionOperation.REMOVE,
          reference_id: withdrawal_id,
          user_id: withdrawal.user_id,
        },
        transaction
      );

      return withdrawal;
    });
  } catch (error) {
    // Put on queue to be tried later oooo
    throw new BadRequestError(error);
  }
};
const adminDeclineWithdrawal = async (req: Request) => {
  const { role } = req.user!;
  const { withdrawal_id } = req.params;
  const { declined_reason } = req.body;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
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
  const { limit, offset } = getPaginate(req.query);

  const res = await Withdrawal.findAndCountAll({
    where: { user_id, ...(processed ? { processed: processed } : {}) },
    limit,
    offset,
  });

  return {
    withdrawals: res.rows,
    total: res.count,
  };
};
const adminFindAll = async (req: Request) => {
  const { role } = req.user!;
  const { processed, user_id, is_declined } = req.query as any;
  const { limit, offset } = getPaginate(req.query);
  const where: WhereFilters<WithdrawalAttributes> = {};

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
    throw new ForbiddenError();
  }

  const res = await Withdrawal.findAndCountAll({ where, limit, offset });

  return {
    withdrawals: res.rows,
    total: res.count,
  };
};

export default {
  withdraw,
  adminProcessWithdrawal,
  adminDeclineWithdrawal,
  findForUser,
  adminFindAll,
};
