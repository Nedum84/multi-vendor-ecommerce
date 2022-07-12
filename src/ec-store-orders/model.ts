import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { DeliveryStatus, OrderStatus } from "../ec-orders/types";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { OrdersInstance } from "../ec-orders/model";
import { StoreOrdersProductInstance } from "../ec-store-orders-products/model";

export interface StoreOrdersAttributes {
  store_order_id: string;
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

interface StoreOrdersCreationAttributes extends Optional<StoreOrdersAttributes, "store_order_id"> {}

export interface StoreOrdersInstance
  extends Model<StoreOrdersAttributes, StoreOrdersCreationAttributes>,
    StoreOrdersAttributes {
  order: OrdersInstance;
  products: StoreOrdersProductInstance[];
}

//--> Model attributes
export const StoreOrdersModelAttributes: SequelizeAttributes<StoreOrdersAttributes> = {
  store_order_id: {
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
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  sub_total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  coupon_amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  shipping_amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  tax_amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  store_price: {
    type: DataTypes.FLOAT,
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
export function StoreOrdersFactory(sequelize: Sequelize) {
  const StoreOrders = <ModelStatic<StoreOrdersInstance>>sequelize.define(
    "StoreOrders",
    StoreOrdersModelAttributes as any,
    {
      timestamps: true,
      paranoid: true,
      tableName: "StoreOrders",
      freezeTableName: true,
      defaultScope: {},
      scopes: {},
      indexes: [{ fields: ["order_id"] }, { fields: ["store_id"] }],
    }
  );

  StoreOrders.associate = function (models: ModelRegistry) {
    const { StoreOrders } = models;

    StoreOrders.belongsTo(models.Orders, {
      as: "order",
      foreignKey: "order_id",
      targetKey: "order_id",
    });

    StoreOrders.belongsTo(models.Store, {
      as: "store",
      foreignKey: "store_id",
      targetKey: "store_id",
    });
    StoreOrders.hasMany(models.StoreOrdersProduct, {
      as: "products",
      foreignKey: "store_order_id",
      sourceKey: "store_order_id",
    });

    StoreOrders.belongsTo(models.User, {
      as: "cancelled_user",
      foreignKey: "cancelled_by",
      targetKey: "user_id",
    });

    StoreOrders.belongsTo(models.User, {
      as: "purchased_user",
      foreignKey: "purchased_by",
      targetKey: "user_id",
    });
  };

  StoreOrders.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return StoreOrders;
}
