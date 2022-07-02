import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { FundingTypes } from "../ec-orders/payment.enum";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface UserWalletAttributes {
  user_id: string;
  amount: number;
  fund_type: FundingTypes;
  payment_reference: string;
  action_performed_by: string;
  store_order_id?: string;
  credit_code?: string;
}

interface UserWalletCreationAttributes
  extends Optional<UserWalletAttributes, "store_order_id" | "payment_reference" | "credit_code"> {}

export interface UserWalletInstance
  extends Model<UserWalletAttributes, UserWalletCreationAttributes>,
    UserWalletAttributes {}

//--> Model attributes
export const UserWalletModelAttributes: SequelizeAttributes<UserWalletAttributes> = {
  user_id: {
    type: DataTypes.STRING,
    comment: "User's' Id",
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  fund_type: {
    type: DataTypes.ENUM,
    values: Object.values(FundingTypes),
    defaultValue: FundingTypes.REFUND,
  },
  payment_reference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  action_performed_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  store_order_id: DataTypes.STRING, //not null for refund
  credit_code: DataTypes.STRING, // not null for credit redeem code
};

// --> Factory....
export function UserWalletFactory(sequelize: Sequelize) {
  const UserWallet = <ModelStatic<UserWalletInstance>>sequelize.define(
    "UserWallet",
    UserWalletModelAttributes as any,
    {
      timestamps: true,
      tableName: "UserWallet",
      freezeTableName: true,
      indexes: [{ fields: ["user_id"] }],
      validate: {
        paymentReferenceErr() {
          if (!this.payment_reference && this.fund_type !== FundingTypes.REFUND) {
            throw new Error("Payment Reference can't be null unless except for refund");
          }
        },
      },
    }
  );

  UserWallet.associate = function (models: ModelRegistry) {
    const { UserWallet } = models;

    UserWallet.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  UserWallet.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return UserWallet;
}
