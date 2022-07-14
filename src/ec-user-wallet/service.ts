import { Transaction } from "sequelize/types";
import { TransactionOperation } from "../ec-transaction/types";
import { UserWallet } from "../ec-models";

const create = async (
  user_id: string,
  amount: number,
  operation: TransactionOperation,
  transaction?: Transaction
) => {
  const $balance = await balance(user_id, transaction);
  if (operation === TransactionOperation.ADD) {
    return UserWallet.upsert({ user_id, balance: $balance + amount }, { transaction });
  } else {
    return UserWallet.upsert({ user_id, balance: $balance - amount }, { transaction });
  }
};

const balance = async (user_id: string, transaction?: Transaction) => {
  const $find = await UserWallet.findOne({ where: { user_id }, transaction });
  if ($find) {
    return $find.balance;
  }

  return 0;
};

export default { create, balance };
