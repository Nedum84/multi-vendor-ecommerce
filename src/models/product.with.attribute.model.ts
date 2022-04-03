import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface ProductWithAttributeAttributes {
  product_id: string;
  attribute_id: string;
}

export interface ProductWithAttributeInstance
  extends Model<ProductWithAttributeAttributes, ProductWithAttributeAttributes>,
    ProductWithAttributeAttributes {}

//--> Model attributes
export const ProductWithAttributeModelAttributes: SequelizeAttributes<ProductWithAttributeAttributes> = {
  product_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  attribute_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
};
// --> Factory....
export function ProductWithAttributeFactory(sequelize: Sequelize) {
  const ProductWithAttribute = <ModelStatic<ProductWithAttributeInstance>>sequelize.define(
    "ProductWithAttribute",
    ProductWithAttributeModelAttributes as any,
    {
      timestamps: true,
      tableName: "ProductWithAttribute",
      freezeTableName: true,
    }
  );

  ProductWithAttribute.associate = function (models: ModelRegistry) {
    const { ProductWithAttribute } = models;

    ProductWithAttribute.belongsTo(models.Product, {
      as: "products",
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    ProductWithAttribute.belongsTo(models.ProductAttribute, {
      as: "attrs",
      foreignKey: "attribute_id",
      targetKey: "attribute_id",
    });
  };

  ProductWithAttribute.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return ProductWithAttribute;
}
