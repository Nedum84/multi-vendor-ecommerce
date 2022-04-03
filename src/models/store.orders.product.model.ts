import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { ProductVariationInstance } from "./product.variation.model";

export interface StoreOrdersProductAttributes {
  sub_order_id: string;
  variation_id: string;
  product_id: string;
  price: number;
  purchased_price: number;
  name: string;
  desc: string;
  qty: number;
  weight: number; //in gram
  variation_snapshot: ProductVariationInstance;
}

export interface StoreOrdersProductInstance
  extends Model<StoreOrdersProductAttributes, StoreOrdersProductAttributes>,
    StoreOrdersProductAttributes {}

//--> Model attributes
export const StoreOrdersProductModelAttributes: SequelizeAttributes<StoreOrdersProductAttributes> = {
  sub_order_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  variation_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purchased_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  variation_snapshot: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
};
// --> Factory....
export function StoreOrdersProductFactory(sequelize: Sequelize) {
  const StoreOrdersProduct = <ModelStatic<StoreOrdersProductInstance>>sequelize.define(
    "StoreOrdersProduct",
    StoreOrdersProductModelAttributes as any,
    {
      timestamps: false,
      tableName: "StoreOrdersProduct",
      freezeTableName: true,
      indexes: [{ fields: ["sub_order_id"] }],
      defaultScope: {
        attributes: {
          exclude: ["variation_snapshot"],
        },
      },
      hooks: {
        beforeUpsert: (product: StoreOrdersProductInstance) => {
          // product.variation_snapshot = JSON.stringify(product.variation_snapshot.toJSON()) as any;
        },
        afterFind: async (product: StoreOrdersProductInstance) => {
          // product.variation_snapshot = JSON.parse(product.variation_snapshot as any);
        },
      },
    }
  );

  StoreOrdersProduct.associate = function (models: ModelRegistry) {
    const { StoreOrdersProduct } = models;

    StoreOrdersProduct.belongsTo(models.StoreOrders, {
      as: "order",
      foreignKey: "sub_order_id",
      targetKey: "sub_order_id",
    });
    StoreOrdersProduct.belongsTo(models.Product, {
      as: "product",
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    StoreOrdersProduct.belongsTo(models.ProductVariation, {
      as: "variation",
      foreignKey: "variation_id",
      targetKey: "variation_id",
    });
  };

  StoreOrdersProduct.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return StoreOrdersProduct;
}
