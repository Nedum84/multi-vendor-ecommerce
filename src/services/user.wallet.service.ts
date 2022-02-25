import { Orders, UserWallet } from "../models";
import { Sequelize, Transaction } from "sequelize/dist";
import { FundingTypes } from "../enum/payment.enum";
import { Request } from "express";
import { Helpers } from "../utils/helpers";
import { ErrorResponse } from "../apiresponse/error.response";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { isAdmin } from "../utils/admin.utils";
import { genUniqueColId } from "../utils/random.string";

//admin reward
const adminCreateCreditReward = async (req: Request) => {
  const { user_id, amount }: { user_id: string; amount: number } = req.body;

  const { role } = req.user!;
  const payment_reference = await genUniqueColId(UserWallet, "payment_reference", 17);

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  return createCredit(user_id, amount, FundingTypes.ADMIN_REWARD, payment_reference);
};
//From payment
const userCreateCreditReward = async (req: Request) => {
  const { user_id } = req.user!;
  const { payment_reference, amount }: { payment_reference: string; amount: number } = req.body;

  //TODO:: verify the payment with the payment_reference

  return createCredit(user_id, amount, FundingTypes.PAYMENT, payment_reference);
};

const createCredit = async (
  user_id: string,
  amount: number,
  fund_type: FundingTypes,
  payment_reference: string,
  sub_order_id?: string,
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
      payment_reference,
      sub_order_id,
    },
    { transaction: t }
  );

  return credit;
};

//get balance
const getWalletBalance = async (user_id: string): Promise<number> => {
  const totalBalance_: any[] = await UserWallet.findAll({
    where: { user_id },
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "total_balance"]],
    raw: true,
  });

  const usedBalance_: any[] = await Orders.findAll({
    where: { purchased_by: user_id, payed_from_wallet: true },
    attributes: [[Sequelize.fn("sum", Sequelize.col("amount")), "used_balance"]],
    raw: true,
  });

  // const totalBalance = parseInt(totalBalance_[0]?.total_balance ?? 0);
  // const usedBalance = parseInt(usedBalance_[0]?.used_balance ?? 0);
  // OR
  const totalBalance = await UserWallet.sum("amount", {
    where: { user_id },
  });
  ///---> This(Below) remains correct, you know why,
  ///===> EVen if the order was refunded, It would reflect on UserWallet table (as a new credit) and the we are good
  const usedBalance = await Orders.sum("amount", {
    where: { purchased_by: user_id, payed_from_wallet: true },
  });

  const balance = totalBalance - usedBalance;

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
