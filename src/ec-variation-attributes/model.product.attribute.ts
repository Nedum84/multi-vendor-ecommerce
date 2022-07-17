import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface ProductAttributeAttributes {
  attribute_id: string;
  name: string;
  desc: Date;
  active: boolean;
}

interface ProductCreationAttributeAttributes
  extends Optional<ProductAttributeAttributes, "desc" | "active"> {}

export interface ProductAttributeInstance
  extends Model<ProductAttributeAttributes, ProductCreationAttributeAttributes>,
    ProductAttributeAttributes {}

//--> Model attributes
export const ProductAttributeModelAttributes: SequelizeAttributes<ProductAttributeAttributes> = {
  attribute_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: {
    type: DataTypes.STRING,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};
// --> Factory....
export function ProductAttributeFactory(sequelize: Sequelize) {
  const ProductAttribute = <ModelStatic<ProductAttributeInstance>>sequelize.define(
    "ProductAttribute",
    ProductAttributeModelAttributes as any,
    {
      timestamps: true,
      tableName: "ProductAttribute",
      freezeTableName: true,
      paranoid: true,
    }
  );

  ProductAttribute.associate = function (models: ModelRegistry) {
    const { ProductAttribute } = models;

    ProductAttribute.hasMany(models.ProductAttributeSets, {
      as: "sets",
      foreignKey: "attribute_id",
      sourceKey: "attribute_id",
    });

    ProductAttribute.hasMany(models.ProductWithAttribute, {
      as: "products",
      foreignKey: "attribute_id",
      sourceKey: "attribute_id",
    });
  };

  ProductAttribute.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return ProductAttribute;
}
