import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface TagAttributes {
  tag_id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface TagCreationAttributes extends Optional<TagAttributes, "tag_id" | "is_active"> {}

export interface TagInstance extends Model<TagAttributes, TagCreationAttributes>, TagAttributes {}

//--> Model attributes
export const TagModelAttributes: SequelizeAttributes<TagAttributes> = {
  tag_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};
// --> Factory....
export function TagFactory(sequelize: Sequelize) {
  const Tag = <ModelStatic<TagInstance>>sequelize.define("Tag", TagModelAttributes as any, {
    timestamps: true,
    tableName: "Tag",
    freezeTableName: true,
  });

  Tag.associate = function (models: ModelRegistry) {
    const { Tag } = models;
    Tag.belongsToMany(models.Product, {
      as: "products",
      through: models.TagProduct,
      foreignKey: "tag_id",
      targetKey: "product_id",
    });
  };

  return Tag;
}
