import { Orders, UserWallet } from "../models";
import { Sequelize, Transaction } from "sequelize/dist";
import { FundingTypes } from "../enum/payment.enum";
import { Request } from "express";
import { Helpers } from "../utils/helpers";
import { ErrorResponse } from "../apiresponse/error.response";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { isAdmin } from "../utils/admin.utils";

//admin reward
const adminCreateCreditReward = async (req: Request) => {
  const { user_id, amount, payment_id }: { user_id: string; amount: number; payment_id: string } = req.body;

  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  return createCredit(user_id, amount, FundingTypes.ADMIN_REWARD, payment_id);
};
//From payment
const userCreateCreditReward = async (req: Request) => {
  const { user_id } = req.user!;
  const { payment_id, amount }: { payment_id: string; amount: number } = req.body;

  //TODO:: verify the payment with the payment_id

  return createCredit(user_id, amount, FundingTypes.PAYMENT, payment_id);
};

const createCredit = async (
  user_id: string,
  amount: number,
  fund_type: FundingTypes,
  payment_id?: string,
  t?: Transaction
) => {
  if (fund_type == FundingTypes.REG_BONUS) {
    const exist = await UserWallet.findOne({ where: { user_id, fund_type }, transaction: t });
    if (exist) {
      throw new ErrorResponse("Already received bonus");
    }
  }
  const credit = await UserWallet.create(
    {
      amount,
      fund_type,
      user_id,
      payment_id,
    },
    { transaction: t }
  );

  return credit;
};

//get balance
const getWalletBalance = async (user_id: string): Promise<number> => {
  const totalBalance2: any[] = await UserWallet.findAll({
    where: { user_id },
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "total_balance"]],
    raw: true,
  });
  const totalBalance = await UserWallet.sum("amount", {
    where: { user_id },
  });

  const usedBalance: any[] = await Orders.findAll({
    where: { purchased_by: user_id, payed_from_wallet: true },
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "used_balance"]],
    raw: true,
  });

  // const totalBalance_ = parseInt(totalBalance[0]?.total_balance ?? 0);
  const totalBalance_ = totalBalance;
  const usedBalance_ = parseInt(usedBalance[0]?.used_balance ?? 0);

  const balance = totalBalance_ - usedBalance_;

  return balance;
};

//get balance
const balanceHistory = async (req: Request) => {
  const { user_id } = req.user!;
  const paginate = Helpers.getPaginate(req.query);

  const history = await UserWallet.findAll({
    where: { user_id },
    ...paginate,
  });

  return history;
};

export default {
  adminCreateCreditReward,
  userCreateCreditReward,
  createCredit,
  getWalletBalance,
  balanceHistory,
};
