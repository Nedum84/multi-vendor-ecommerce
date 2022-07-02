import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface ProductVariationWithAttributeSetAttributes {
  variation_id: string;
  attribute_set_id: string;
}

export interface ProductVariationWithAttributeSetInstance
  extends Model<
      ProductVariationWithAttributeSetAttributes,
      ProductVariationWithAttributeSetAttributes
    >,
    ProductVariationWithAttributeSetAttributes {}

//--> Model attributes
export const ProductVariationWithAttributeSetModelAttributes: SequelizeAttributes<ProductVariationWithAttributeSetAttributes> =
  {
    variation_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    attribute_set_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  };
// --> Factory....
export function ProductVariationWithAttributeSetFactory(sequelize: Sequelize) {
  const ProductVariationWithAttributeSet = <ModelStatic<ProductVariationWithAttributeSetInstance>>(
    sequelize.define(
      "ProductVariationWithAttributeSet",
      ProductVariationWithAttributeSetModelAttributes as any,
      {
        timestamps: true,
        tableName: "ProductVariationWithAttributeSet",
        freezeTableName: true,
      }
    )
  );

  ProductVariationWithAttributeSet.associate = function (models: ModelRegistry) {
    const { ProductVariationWithAttributeSet } = models;
  };

  ProductVariationWithAttributeSet.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return ProductVariationWithAttributeSet;
}
