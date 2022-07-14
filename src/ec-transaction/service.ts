import { Request } from "express";
import { Op, Transaction as SequeizeTransaction } from "sequelize";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { TransactionOperation } from "./types";
import { Transaction } from "../ec-models";
import { TransactionAttributes, TransactionInstance } from "./model";
import { WhereFiltersOptimized } from "../ec-models/types";
import userWalletService from "../ec-user-wallet/service";
import { createModel, getPaginate } from "../ec-models/utils";
import { isAdmin } from "../ec-apps/app-admin/roles.service";

const create = async (
  body: Omit<TransactionAttributes, "transaction_id">,
  t?: SequeizeTransaction
) => {
  const transaction = await createModel<TransactionInstance>(Transaction, body, "transaction_id", {
    transaction: t,
  });

  // Update wallet
  await userWalletService.create(body.user_id, body.amount, body.operation, t);

  return transaction;
};

//get balance
const balance = async (user_id: string) => {
  const inflow = await Transaction.sum("amount", {
    where: { user_id, operation: TransactionOperation.ADD },
  });

  const outflow = await Transaction.sum("amount", {
    where: { user_id, operation: TransactionOperation.REMOVE },
  });

  const balance = inflow - outflow;
  return balance;
};
const findById = async (transaction_id: string) => {
  const transaction = await Transaction.findByPk(transaction_id);
  if (!transaction) {
    throw new NotFoundError("No transaction found");
  }
  return transaction;
};

const findAll = async (req: Request) => {
  const { user_id } = req.user!;
  const { limit, offset } = getPaginate(req.query);
  const { operation, date_from, date_to, transaction_id } = req.query as any;

  const where: WhereFiltersOptimized<TransactionAttributes> = [{ user_id }];

  if (operation) {
    where.push({ operation });
  }
  if (transaction_id) {
    where.push({ transaction_id });
  }

  if (date_from) {
    where.push({ created_at: { [Op.gte]: date_from } as any });
  }

  if (date_to) {
    where.push({ created_at: { [Op.lte]: date_to } as any });
  }

  const transactions = await Transaction.findAndCountAll({
    where: { [Op.and]: where },
    order: [["created_at", "DESC"]],
    offset,
    limit,
  });

  return {
    transactions: transactions.rows,
    total: transactions.count,
  };
};

const adminFindAll = async (req: Request) => {
  const { role } = req.user!;
  const { limit, offset } = getPaginate(req.query);
  const { operation, date_from, date_to, user_id, transaction_id } = req.query as any;

  const where: WhereFiltersOptimized<TransactionAttributes> = [{}];

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  if (operation) {
    where.push({ operation });
  }
  if (transaction_id) {
    where.push({ transaction_id });
  }
  if (user_id) {
    where.push({ user_id });
  }

  if (date_from) {
    where.push({ created_at: { [Op.gte]: date_from } as any });
  }

  if (date_to) {
    where.push({ created_at: { [Op.lte]: date_to } as any });
  }

  const transactions = await Transaction.findAndCountAll({
    where: { [Op.and]: where },
    order: [["created_at", "DESC"]],
    offset,
    limit,
  });

  return {
    transactions: transactions.rows,
    total: transactions.count,
  };
};

export default {
  create,
  balance,
  findById,
  findAll,
  adminFindAll,
};
