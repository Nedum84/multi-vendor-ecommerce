import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface OrdersAddressAttributes {
  order_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

export interface OrdersAddressInstance
  extends Model<OrdersAddressAttributes, OrdersAddressAttributes>,
    OrdersAddressAttributes {}

//--> Model attributes
export const OrdersAddressModelAttributes: SequelizeAttributes<OrdersAddressAttributes> = {
  order_id: {
    type: DataTypes.STRING,
    primaryKey: true,
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
};
// --> Factory....
export function OrdersAddressFactory(sequelize: Sequelize) {
  const OrdersAddress = <ModelStatic<OrdersAddressInstance>>sequelize.define(
    "OrdersAddress",
    OrdersAddressModelAttributes as any,
    {
      timestamps: true,
      tableName: "OrdersAddress",
      freezeTableName: true,
    }
  );

  OrdersAddress.associate = function (models: ModelRegistry) {
    const { OrdersAddress } = models;
  };

  OrdersAddress.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return OrdersAddress;
}
