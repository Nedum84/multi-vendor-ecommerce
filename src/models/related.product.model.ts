import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface RelatedProductAttributes {
  product_id: string;
  related_product_id: string;
}

export interface RelatedProductInstance
  extends Model<RelatedProductAttributes, RelatedProductAttributes>,
    RelatedProductAttributes {}

//--> Model attributes
export const RelatedProductModelAttributes: SequelizeAttributes<RelatedProductAttributes> = {
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  related_product_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
// --> Factory....
export function RelatedProductFactory(sequelize: Sequelize) {
  const RelatedProduct = <ModelStatic<RelatedProductInstance>>sequelize.define(
    "RelatedProduct",
    RelatedProductModelAttributes as any,
    {
      timestamps: false,
      tableName: "RelatedProduct",
      freezeTableName: true,
      defaultScope: {},
      scopes: {},
    }
  );

  RelatedProduct.associate = function (models: ModelRegistry) {
    const { RelatedProduct } = models;

    RelatedProduct.belongsTo(models.Product, {
      as: "related_product",
      foreignKey: "related_product_id",
      targetKey: "product_id",
    });
    RelatedProduct.belongsTo(models.Product, {
      as: "product",
      foreignKey: "product_id",
      targetKey: "product_id",
    });
  };

  RelatedProduct.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return RelatedProduct;
}
