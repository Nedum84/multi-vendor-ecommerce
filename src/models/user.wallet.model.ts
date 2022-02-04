import { Sequelize } from "sequelize/dist";
import { Model, Optional, DataTypes } from "sequelize/dist";
import { FundingTypes } from "../enum/payment.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface UserWalletAttributes {
  user_id: string;
  order_id: string;
  amount: number;
  fund_type: FundingTypes;
  payment_id: string;
}

interface UserWalletCreationAttributes extends Optional<UserWalletAttributes, "order_id" | "payment_id"> {}

export interface UserWalletInstance
  extends Model<UserWalletAttributes, UserWalletCreationAttributes>,
    UserWalletAttributes {}

//--> Model attributes
export const UserWalletModelAttributes: SequelizeAttributes<UserWalletAttributes> = {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    comment: "UserWallets Id",
    allowNull: false,
  },
  order_id: DataTypes.STRING, //not null for refund
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fund_type: {
    type: DataTypes.ENUM,
    values: Object.values(FundingTypes),
    defaultValue: FundingTypes.REFUND,
  },
  payment_id: {
    type: DataTypes.STRING, //null for only refund
    validate: {
      customValidator(value: string) {
        if (value === null && this.fund_type !== FundingTypes.REFUND) {
          throw new Error("Payment ID can't be null unless except for refund");
        }
      },
    },
  },
};

// --> Factory....
export function UserWalletFactory(sequelize: Sequelize) {
  const UserWallet = <ModelStatic<UserWalletInstance>>sequelize.define("UserWallet", UserWalletModelAttributes as any, {
    timestamps: true,
    tableName: "UserWallet",
    freezeTableName: true,
  });

  UserWallet.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return UserWallet;
}
