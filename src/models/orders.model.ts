import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { OrderStatus } from "../enum/orders.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { OrdersPaymentInstance } from "./orders.payment.model";
import { SubOrdersInstance } from "./sub.orders.model";

export interface OrdersAttributes {
  order_id: string;
  amount: number;
  sub_total: number;
  coupon_code: string;
  coupon_amount: number;
  shipping_amount: number;
  tax_amount: number;
  purchased_by: string;
  payed_from_wallet: boolean;
  order_status: OrderStatus;
}

interface OrdersCreationAttributes
  extends Optional<OrdersAttributes, "order_id" | "payed_from_wallet" | "order_status"> {}

export interface OrdersInstance extends Model<OrdersAttributes, OrdersCreationAttributes>, OrdersAttributes {
  payment: OrdersPaymentInstance;
  sub_orders: SubOrdersInstance[];
}

//--> Model attributes
export const OrdersModelAttributes: SequelizeAttributes<OrdersAttributes> = {
  order_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sub_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coupon_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  shipping_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  purchased_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payed_from_wallet: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  order_status: {
    type: DataTypes.ENUM,
    values: Object.values(OrderStatus),
    defaultValue: OrderStatus.PENDING,
  },
};
// --> Factory....
export function OrdersFactory(sequelize: Sequelize) {
  const Orders = <ModelStatic<OrdersInstance>>sequelize.define("Orders", OrdersModelAttributes as any, {
    timestamps: true,
    tableName: "Orders",
    freezeTableName: true,
    defaultScope: {},
  });

  Orders.associate = function (models: ModelRegistry) {
    const { Orders } = models;

    Orders.hasMany(models.SubOrders, {
      as: "sub_orders",
      foreignKey: "order_id",
      sourceKey: "order_id",
    });

    Orders.hasOne(models.OrdersPayment, {
      as: "payment",
      foreignKey: "order_id",
      sourceKey: "order_id",
    });
  };

  Orders.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return Orders;
}
