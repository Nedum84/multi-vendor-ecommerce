import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface CategoryProductAttributes {
  product_id: string;
  category_id: string;
}

export interface CategoryProductInstance
  extends Model<CategoryProductAttributes, CategoryProductAttributes>,
    CategoryProductAttributes {}

//--> Model attributes
export const CategoryProductModelAttributes: SequelizeAttributes<CategoryProductAttributes> = {
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
// --> Factory....
export function CategoryProductFactory(sequelize: Sequelize) {
  const CategoryProduct = <ModelStatic<CategoryProductInstance>>sequelize.define(
    "CategoryProduct",
    CategoryProductModelAttributes as any,
    {
      timestamps: false,
      tableName: "CategoryProduct",
      freezeTableName: true,
    }
  );

  CategoryProduct.associate = function (models: ModelRegistry) {
    const { CategoryProduct } = models;
  };

  return CategoryProduct;
}
