import { Sequelize } from "sequelize/dist";
import { Model, Optional, DataTypes } from "sequelize/dist";
import { ModelRegistry } from ".";
import { ErrorResponse } from "../apiresponse/error.response";
import { FundingTypes } from "../enum/payment.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface UserWalletAttributes {
  user_id: string;
  sub_order_id: string;
  amount: number;
  fund_type: FundingTypes;
  payment_reference: string;
}

interface UserWalletCreationAttributes extends Optional<UserWalletAttributes, "sub_order_id" | "payment_reference"> {}

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
  sub_order_id: DataTypes.STRING, //not null for refund
  amount: {
    type: DataTypes.INTEGER,
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
};

// --> Factory....
export function UserWalletFactory(sequelize: Sequelize) {
  const UserWallet = <ModelStatic<UserWalletInstance>>sequelize.define("UserWallet", UserWalletModelAttributes as any, {
    timestamps: true,
    tableName: "UserWallet",
    freezeTableName: true,
    validate: {
      paymentReferenceErr() {
        if (!this.payment_reference && this.fund_type !== FundingTypes.REFUND) {
          throw new Error("Payment Reference can't be null unless except for refund");
        }
      },
    },
  });

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
