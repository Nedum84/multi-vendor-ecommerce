import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { FundingTypes } from "../enum/payment.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface WithdrawalAttributes {
  withdrawal_id: string;
  user_id: string;
  amount: number;
  amount_user_will_receive: number;
  charges: number; //maybe tax or any additional charge
  processed: boolean;
  processed_at: Date;
  is_declined: boolean;
  declined_reason: string;
}
// ...>>> amount = amount_user_will_receive + charges;

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
  amount_user_will_receive: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  charges: {
    type: DataTypes.FLOAT,
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
  const Withdrawal = <ModelStatic<WithdrawalInstance>>sequelize.define("Withdrawal", WithdrawalModelAttributes as any, {
    timestamps: true,
    tableName: "Withdrawal",
    freezeTableName: true,
    validate: {
      paymentReferenceErr() {
        if (!this.payment_reference && this.fund_type !== FundingTypes.REFUND) {
          throw new Error("Payment Reference can't be null unless except for refund");
        }
      },
    },
  });

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
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return Withdrawal;
}
