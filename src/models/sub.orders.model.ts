import { Optional, Sequelize } from "sequelize/dist";
import { Model, DataTypes } from "sequelize/dist";
import { ModelRegistry } from ".";
import { DeliveryStatus, OrderStatus } from "../enum/orders.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface SubOrdersAttributes {
  sub_order_id: string;
  order_id: string;
  store_id: string;
  amount: number; //amount to be paid for this order {{ amount = sub_total - coupon_amount + shipping_amount + tax_amount }}
  sub_total: number; //sum of product prices(sale or discount)
  coupon_amount: number; //amount of the coupon applied
  shipping_amount: number;
  tax_amount: number;
  store_price: number;
  order_status: OrderStatus;
  delivery_status: DeliveryStatus;
  refunded: boolean; //if customer is refunded
  refunded_at: Date;
  delivered: boolean;
  delivered_at: Date;
  cancelled_by: string;
  settled: boolean; //if tutor is settled for this order: ;
  settled_at: Date;
  purchased_by: string; //purchased by...
  createdAt?: Date;
  updatedAt?: Date;
}
//--> TAKE NOTE OF::: RefundPeriod :::ON Orders service.ts

interface SubOrdersCreationAttributes extends Optional<SubOrdersAttributes, "sub_order_id"> {}

export interface SubOrdersInstance
  extends Model<SubOrdersAttributes, SubOrdersCreationAttributes>,
    SubOrdersAttributes {}

//--> Model attributes
export const SubOrdersModelAttributes: SequelizeAttributes<SubOrdersAttributes> = {
  sub_order_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // coupon_code: DataTypes.STRING,
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sub_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coupon_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shipping_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  store_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_status: {
    type: DataTypes.ENUM,
    values: Object.values(OrderStatus),
    defaultValue: OrderStatus.PENDING,
  },
  delivery_status: {
    type: DataTypes.ENUM,
    values: Object.values(DeliveryStatus),
    defaultValue: DeliveryStatus.DELIVERING,
  },
  refunded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refunded_at: DataTypes.DATE,
  delivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  delivered_at: DataTypes.DATE,
  cancelled_by: DataTypes.STRING,
  settled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  settled_at: DataTypes.DATE,
  purchased_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

// --> Factory....
export function SubOrdersFactory(sequelize: Sequelize) {
  const SubOrders = <ModelStatic<SubOrdersInstance>>sequelize.define("SubOrders", SubOrdersModelAttributes as any, {
    timestamps: true,
    paranoid: true,
    tableName: "SubOrders",
    freezeTableName: true,
    defaultScope: {},
    scopes: {},
  });

  SubOrders.associate = function (models: ModelRegistry) {
    const { SubOrders } = models;

    SubOrders.belongsTo(models.User, {
      as: "user",
      foreignKey: "purchased_by",
      targetKey: "user_id",
    });

    SubOrders.belongsTo(models.Store, {
      as: "store",
      foreignKey: "store_id",
      targetKey: "store_id",
    });
  };

  SubOrders.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return SubOrders;
}
