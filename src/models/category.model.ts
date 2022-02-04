import { Optional, Sequelize } from "sequelize/dist";
import { Model, DataTypes } from "sequelize/dist";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface CategoryAttributes {
  category_id: string;
  parent_id: string | null;
  name: string;
  desc: string;
  icon: string;
  active: boolean;
}

interface CategoryCreationAttributes
  extends Optional<
    CategoryAttributes,
    "category_id" | "parent_id" | "desc" | "icon"
  > {}

export interface CategoryInstance
  extends Model<CategoryAttributes, CategoryCreationAttributes>,
    CategoryAttributes {
  setDataValue: (key: any, val: any) => void;
}

//--> Model attributes
export const CategoryModelAttributes: SequelizeAttributes<CategoryAttributes> =
  {
    category_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Category Id",
      allowNull: false,
      unique: true,
    },
    parent_id: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: DataTypes.STRING,
    icon: DataTypes.STRING,
    active: {
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
  };

  Category.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return Category;
}
