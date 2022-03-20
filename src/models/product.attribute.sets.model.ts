import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface ProductAttributeSetsAttributes {
  attribute_set_id: string;
  attribute_id: string;
  value: string;
  color: string;
  image: string;
}

interface ProductCreationAttributeAttributes extends Optional<ProductAttributeSetsAttributes, "color" | "image"> {}

export interface ProductAttributeSetsInstance
  extends Model<ProductAttributeSetsAttributes, ProductCreationAttributeAttributes>,
    ProductAttributeSetsAttributes {}

//--> Model attributes
export const ProductAttributeSetsModelAttributes: SequelizeAttributes<ProductAttributeSetsAttributes> = {
  attribute_set_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  attribute_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: DataTypes.STRING,
  image: DataTypes.STRING,
};
// --> Factory....
export function ProductAttributeSetsFactory(sequelize: Sequelize) {
  const ProductAttributeSets = <ModelStatic<ProductAttributeSetsInstance>>sequelize.define(
    "ProductAttributeSets",
    ProductAttributeSetsModelAttributes as any,
    {
      timestamps: true,
      tableName: "ProductAttributeSets",
      freezeTableName: true,
      indexes: [{ fields: ["attribute_id"] }],
    }
  );

  ProductAttributeSets.associate = function (models: ModelRegistry) {
    const { ProductAttributeSets } = models;

    ProductAttributeSets.belongsTo(models.ProductAttribute, {
      as: "attribute",
      foreignKey: "attribute_id",
      targetKey: "attribute_id",
    });

    ProductAttributeSets.belongsToMany(models.ProductVariation, {
      as: "variations",
      through: models.ProductVariationWithAttributeSet,
      foreignKey: "attribute_set_id",
      targetKey: "variation_id",
    });
  };

  ProductAttributeSets.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return ProductAttributeSets;
}
