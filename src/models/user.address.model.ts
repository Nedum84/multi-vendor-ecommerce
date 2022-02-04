import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface UserAddressAttributes {
  address_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  is_default: boolean;
}

interface UserAddressCreationAttributes extends Optional<UserAddressAttributes, "is_default" | "zip_code"> {}

export interface UserAddressInstance
  extends Model<UserAddressAttributes, UserAddressCreationAttributes>,
    UserAddressAttributes {}

//--> Model attributes
export const UserAddressModelAttributes: SequelizeAttributes<UserAddressAttributes> = {
  address_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zip_code: {
    type: DataTypes.INTEGER,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};
// --> Factory....
export function UserAddressFactory(sequelize: Sequelize) {
  const UserAddress = <ModelStatic<UserAddressInstance>>sequelize.define(
    "UserAddress",
    UserAddressModelAttributes as any,
    {
      timestamps: true,
      tableName: "UserAddress",
      freezeTableName: true,
    }
  );

  UserAddress.associate = function (models: ModelRegistry) {
    const { UserAddress } = models;
  };

  UserAddress.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return UserAddress;
}
