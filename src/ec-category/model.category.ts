import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface CategoryAttributes {
  category_id: string;
  parent_id: string | null;
  name: string;
  desc: string;
  icon: string;
  banner: string;
  active: boolean;
  is_featured: boolean;
}

interface CategoryCreationAttributes
  extends Optional<
    CategoryAttributes,
    "category_id" | "parent_id" | "desc" | "icon" | "is_featured"
  > {}

export interface CategoryInstance
  extends Model<CategoryAttributes, CategoryCreationAttributes>,
    CategoryAttributes {
  setDataValue: (key: any, val: any) => void;
}

//--> Model attributes
export const CategoryModelAttributes: SequelizeAttributes<CategoryAttributes> = {
  category_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    comment: "Category Id",
    unique: true,
  },
  parent_id: DataTypes.STRING,
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: DataTypes.STRING,
  icon: DataTypes.STRING,
  banner: DataTypes.STRING,
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};

// --> Factory....
export function CategoryFactory(sequelize: Sequelize) {
  const Category = <ModelStatic<CategoryInstance>>sequelize.define(
    "Category",
    CategoryModelAttributes as any,
    {
      timestamps: true,
      tableName: "Category",
      freezeTableName: true,
      indexes: [
        {
          fields: ["parent_id"],
        },
      ],
    }
  );

  Category.associate = function (models: ModelRegistry) {
    const { Category } = models;

    Category.hasMany(models.Category, {
      as: "categories",
      foreignKey: "parent_id",
      sourceKey: "category_id",
      scope: {
        active: true,
      },
    });

    Category.belongsToMany(models.Product, {
      as: "products",
      through: models.CategoryProduct,
      foreignKey: "category_id",
      targetKey: "product_id",
    });
  };

  Category.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return Category;
}
