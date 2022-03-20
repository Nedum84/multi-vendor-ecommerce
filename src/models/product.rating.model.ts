import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface ProductRatingAttributes {
  user_id: string;
  product_id: string;
  store_id: string;
  rating: number;
  message: number;
}

export interface ProductRatingInstance
  extends Model<ProductRatingAttributes, ProductRatingAttributes>,
    ProductRatingAttributes {}

//--> Model attributes
export const ProductRatingModelAttributes: SequelizeAttributes<ProductRatingAttributes> = {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: DataTypes.STRING,
};
// --> Factory....
export function ProductRatingFactory(sequelize: Sequelize) {
  const ProductRating = <ModelStatic<ProductRatingInstance>>sequelize.define(
    "ProductRating",
    ProductRatingModelAttributes as any,
    {
      timestamps: false,
      tableName: "ProductRating",
      freezeTableName: true,
      defaultScope: {},
      scopes: {},
      indexes: [
        {
          fields: ["product_id"],
        },
        { fields: ["store_id"] },
      ],
    }
  );

  ProductRating.associate = function (models: ModelRegistry) {
    const { ProductRating } = models;

    ProductRating.belongsTo(models.Store, {
      as: "store",
      foreignKey: "store_id",
      targetKey: "store_id",
    });
    ProductRating.belongsTo(models.Product, {
      as: "product",
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    ProductRating.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  ProductRating.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return ProductRating;
}
