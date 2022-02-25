import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { ProductVariationInstance } from "./product.variation.model";

export interface SubOrdersProductAttributes {
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

export interface SubOrdersProductInstance
  extends Model<SubOrdersProductAttributes, SubOrdersProductAttributes>,
    SubOrdersProductAttributes {}

//--> Model attributes
export const SubOrdersProductModelAttributes: SequelizeAttributes<SubOrdersProductAttributes> = {
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
export function SubOrdersProductFactory(sequelize: Sequelize) {
  const SubOrdersProduct = <ModelStatic<SubOrdersProductInstance>>sequelize.define(
    "SubOrdersProduct",
    SubOrdersProductModelAttributes as any,
    {
      timestamps: false,
      tableName: "SubOrdersProduct",
      freezeTableName: true,
      defaultScope: {
        attributes: {
          exclude: ["variation_snapshot"],
        },
      },
      hooks: {
        beforeUpsert: (product: SubOrdersProductInstance) => {
          // product.variation_snapshot = JSON.stringify(product.variation_snapshot.toJSON()) as any;
        },
        afterFind: async (product: SubOrdersProductInstance) => {
          // product.variation_snapshot = JSON.parse(product.variation_snapshot as any);
        },
      },
    }
  );

  SubOrdersProduct.associate = function (models: ModelRegistry) {
    const { SubOrdersProduct } = models;

    SubOrdersProduct.belongsTo(models.SubOrders, {
      as: "order",
      foreignKey: "sub_order_id",
      targetKey: "sub_order_id",
    });
  };

  SubOrdersProduct.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return SubOrdersProduct;
}
