import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface FlashSalesProductsAttributes {
  flash_sale_id: string;
  variation_id: string;
  price: number;
  qty: number;
  sold: number;
  index: number;
}

export interface FlashSalesProductsInstance
  extends Model<FlashSalesProductsAttributes, FlashSalesProductsAttributes>,
    FlashSalesProductsAttributes {}

//--> Model attributes
export const FlashSalesProductsModelAttributes: SequelizeAttributes<FlashSalesProductsAttributes> =
  {
    flash_sale_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    variation_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  };
// --> Factory....
export function FlashSalesProductsFactory(sequelize: Sequelize) {
  const FlashSalesProducts = <ModelStatic<FlashSalesProductsInstance>>sequelize.define(
    "FlashSalesProducts",
    FlashSalesProductsModelAttributes as any,
    {
      timestamps: true,
      tableName: "FlashSalesProducts",
      freezeTableName: true,
      indexes: [
        {
          fields: ["flash_sale_id"],
        },
        { fields: ["variation_id"] },
      ],
    }
  );

  FlashSalesProducts.associate = function (models: ModelRegistry) {
    const { FlashSalesProducts } = models;

    FlashSalesProducts.belongsTo(models.ProductVariation, {
      as: "product",
      foreignKey: "variation_id",
      targetKey: "variation_id",
    });
    FlashSalesProducts.belongsTo(models.FlashSales, {
      as: "flash_sale",
      foreignKey: "flash_sale_id",
      targetKey: "flash_sale_id",
    });
  };

  FlashSalesProducts.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return FlashSalesProducts;
}
