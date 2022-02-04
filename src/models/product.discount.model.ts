import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface ProductDiscountAttributes {
  variation_id: string;
  price: number;
  discount_from: Date;
  discount_to: Date;
  revoke: boolean;
}

export interface ProductDiscountInstance
  extends Model<ProductDiscountAttributes, ProductDiscountAttributes>,
    ProductDiscountAttributes {}

//--> Model attributes
export const ProductDiscountModelAttributes: SequelizeAttributes<ProductDiscountAttributes> =
  {
    variation_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    discount_to: DataTypes.DATE,
    revoke: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };
// --> Factory....
export function ProductDiscountFactory(sequelize: Sequelize) {
  const ProductDiscount = <ModelStatic<ProductDiscountInstance>>(
    sequelize.define("ProductDiscount", ProductDiscountModelAttributes as any, {
      timestamps: true,
      tableName: "ProductDiscount",
      freezeTableName: true,
    })
  );

  ProductDiscount.associate = function (models: ModelRegistry) {
    const { ProductDiscount } = models;

    ProductDiscount.belongsTo(models.ProductVariation, {
      as: "product",
      foreignKey: "variation_id",
      targetKey: "variation_id",
    });
  };

  ProductDiscount.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return ProductDiscount;
}
