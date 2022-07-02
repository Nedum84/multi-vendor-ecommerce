import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

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
    primaryKey: true,
  },
  related_product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
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
      indexes: [{ fields: ["product_id"] }],
      validate: {
        productAndRelatedShouldBeDiff: function () {
          if (this.product_id === this.related_product_id) {
            throw new Error("Product & related product should not be the same");
          }
        },
      },
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
