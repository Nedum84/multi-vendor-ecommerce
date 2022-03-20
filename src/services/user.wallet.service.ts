import { Orders, SubOrders, UserWallet, Withdrawal } from "../models";
import { Op, Sequelize, Transaction } from "sequelize";
import { FundingTypes, PaymentChannel } from "../enum/payment.enum";
import { Request } from "express";
import { Helpers } from "../utils/helpers";
import { ErrorResponse } from "../apiresponse/error.response";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { isAdmin } from "../utils/admin.utils";
import { genUniqueColId } from "../utils/random.string";
import { UserWalletAttributes } from "../models/user.wallet.model";
import { CreditCodeType } from "../enum/credit.code.enum";
import creditCodeService from "./credit.code.service";

//admin reward
const adminCreateCreditReward = async (req: Request) => {
  const { user_id: currect_user_id } = req.user!;
  const { user_id, amount }: { user_id: string; amount: number } = req.body;

  const { role } = req.user!;
  const payment_reference = await genUniqueColId(UserWallet, "payment_reference", 17);

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const creditPayload: UserWalletAttributes = {
    user_id,
    amount,
    fund_type: FundingTypes.PAYMENT,
    payment_reference,
    action_performed_by: currect_user_id,
  };
  return createCredit(creditPayload);
};
//From payment
const userCreateCreditReward = async (req: Request) => {
  const { user_id } = req.user!;
  const { payment_reference, amount, channel }: { payment_reference: string; amount: number; channel: PaymentChannel } =
    req.body;

  //TODO:: verify the payment with the payment_reference and channel
  const creditPayload: UserWalletAttributes = {
    user_id,
    amount,
    fund_type: FundingTypes.PAYMENT,
    payment_reference,
    action_performed_by: user_id,
  };

  return createCredit(creditPayload);
};
//credit redeem using credit code
const userRedeemCreditReward = async (req: Request) => {
  const { user_id, role } = req.user!;
  const { credit_code } = req.body;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }
  const { credit_type, users, amount, usage_limit } = await creditCodeService.findByCreditCodeCode(credit_code);

  //check if usage limit is exceeded(if usage limit is not unlimited(not null))
  const checkExist = await UserWallet.findOne({ where: { credit_code } });
  if (checkExist) {
    throw new ErrorResponse("You have already used this code");
  }
  //check if usage limit is exceeded(if usage limit is not unlimited(not null))
  if (usage_limit) {
    const codeUsers = await UserWallet.findAll({ where: { credit_code } });
    if (codeUsers.length >= usage_limit) {
      throw new ErrorResponse("Credit/Redeem code usage limit exceeded");
    }
  }
  if (credit_type == CreditCodeType.USER) {
    const creditUserIds = users.map((x) => x.user_id);
    if (!creditUserIds.includes(user_id)) {
      throw new ErrorResponse("You are not eligible to use this redeem/credit code");
    }
  }
  const payment_reference = await genUniqueColId(UserWallet, "payment_reference", 17);

  const creditPayload: UserWalletAttributes = {
    user_id,
    amount,
    fund_type: FundingTypes.REDEEM_CREDIT,
    payment_reference,
    action_performed_by: user_id,
    credit_code,
  };

  return createCredit(creditPayload);
};

const createCredit = async (payload: UserWalletAttributes, t?: Transaction) => {
  const { fund_type, user_id } = payload;
  if (fund_type == FundingTypes.REG_BONUS) {
    const exist = await UserWallet.findOne({ where: { user_id, fund_type }, transaction: t });
    if (exist) {
      throw new ErrorResponse("Already received bonus");
    }
  }

  const credit = await UserWallet.create(payload, { transaction: t });

  return credit;
};

//get balance
const getWalletBalance = async (user_id: string): Promise<number> => {
  const totalBalance = await UserWallet.sum("amount", {
    where: { user_id },
  });
  ///---> This(Below) remains correct, you know why,
  ///===> EVen if the order was refunded, It would reflect on UserWallet table (as a new credit) and then we are good
  const usedBalance = await Orders.sum("amount", {
    where: { purchased_by: user_id, payed_from_wallet: true },
  });

  const totalWithdrawn = await Withdrawal.sum("amount", {
    where: { user_id, is_declined: false },
  });

  const balance = totalBalance - usedBalance - totalWithdrawn;

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

/**
 * //----->>>>LOGIC
 *  @field if used is less than bonus
 *    @yields withdrawable = payments - withdrawn (payments = Paid directly to wallet or refunded orders not paid from wallet)
 *  @field else
 *    @yields withdrawable = bonus - used + payments
 * @returns @withdrawable
 */
const withrawableBalance = async (user_id: string) => {
  //All the orders I purchased from credit card and was later refunded
  const ordersPayment_: any[] = await SubOrders.findAll({
    where: {
      purchased_by: user_id,
      refunded: true,
      "$order.payed_from_wallet$": false,
      "$order.payment_completed$": true,
    } as any,
    include: { model: Orders, as: "order" },
    attributes: [[Sequelize.fn("sum", Sequelize.col("SubOrders.amount")), "orders_payment"]],
    group: [Sequelize.col("order.order_id")],
    raw: true,
  });
  //All credits I directly topped up
  const walletPayments = await UserWallet.sum("amount", {
    where: { user_id, fund_type: FundingTypes.PAYMENT },
  });
  const ordersPayment = parseInt(ordersPayment_[0]?.orders_payment ?? 0);
  const payments = ordersPayment + walletPayments;

  //All the orders that have been used
  const usedOrderBalance_: any[] = await SubOrders.findAll({
    where: {
      purchased_by: user_id,
      refunded: false,
      "$order.payed_from_wallet$": true,
    } as any,
    include: { model: Orders, as: "order" },
    attributes: [[Sequelize.fn("sum", Sequelize.col("SubOrders.amount")), "used_balance"]],
    group: [Sequelize.col("order.order_id")],
    raw: true,
  });
  const totalWithdrawn = await Withdrawal.sum("amount", {
    where: { user_id, is_declined: false },
  });

  const usedOrderBalance = parseInt(usedOrderBalance_[0]?.used_balance ?? 0);
  const usedBalance = usedOrderBalance + totalWithdrawn;

  //Bonus
  const bonuses = await UserWallet.sum("amount", {
    where: {
      user_id,
      fund_type: {
        [Op.or]: [FundingTypes.REDEEM_CREDIT, FundingTypes.REG_BONUS],
      },
    },
  });

  let withrawable_amount = 0;
  if (bonuses > usedBalance) {
    withrawable_amount = payments - totalWithdrawn;
  } else {
    withrawable_amount = bonuses - usedBalance + payments;
  }

  return {
    withrawable_amount,
    total_payment_from_orders: ordersPayment,
    total_payment_by_topup: walletPayments,
    total_bonus: bonuses,
    total_used_for_purchase: usedOrderBalance,
    total_withdrawn: totalWithdrawn,
  };
};

export default {
  adminCreateCreditReward,
  userCreateCreditReward,
  userRedeemCreditReward,
  createCredit,
  getWalletBalance,
  balanceHistory,
  withrawableBalance,
};
