import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { WithdrawalMeans } from "./types";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { isTest } from "../ec-utils/env.utils";

export interface WithdrawalAttributes {
  withdrawal_id: string;
  user_id: string;
  amount: number; // total_amount = user_amount + transaction_fee
  user_amount: number;
  transaction_fee: number; //maybe tax or any additional charge
  withdrawal_means: WithdrawalMeans;
  processed: boolean;
  processed_at: Date;
  is_declined: boolean;
  declined_reason: string;
}

interface WithdrawalCreationAttributes
  extends Optional<
    WithdrawalAttributes,
    "withdrawal_id" | "processed" | "processed_at" | "is_declined" | "declined_reason"
  > {}

export interface WithdrawalInstance
  extends Model<WithdrawalAttributes, WithdrawalCreationAttributes>,
    WithdrawalAttributes {}

//--> Model attributes
export const WithdrawalModelAttributes: SequelizeAttributes<WithdrawalAttributes> = {
  withdrawal_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  user_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  transaction_fee: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  withdrawal_means: {
    type: DataTypes.ENUM,
    values: Object.values(WithdrawalMeans),
    allowNull: false,
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  processed_at: DataTypes.DATE,
  is_declined: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  declined_reason: DataTypes.STRING,
};

// --> Factory....
export function WithdrawalFactory(sequelize: Sequelize) {
  const Withdrawal = <ModelStatic<WithdrawalInstance>>sequelize.define(
    "Withdrawal",
    WithdrawalModelAttributes as any,
    {
      timestamps: true,
      tableName: "Withdrawal",
      freezeTableName: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      indexes: [
        {
          fields: ["user_id"],
        },
        { fields: ["user_id", "processed", "is_declined"] },
      ],
    }
  );

  Withdrawal.associate = function (models: ModelRegistry) {
    const { Withdrawal } = models;

    Withdrawal.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  Withdrawal.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.created_at;
    delete values.updated_at;
    return values;
  };
  Withdrawal.addHook("afterSave", async (withdrawal) => {
    if (!isTest()) {
      const get = withdrawal.get();
      const id = get.withdrawal_id;
    }
  });
  return Withdrawal;
}
