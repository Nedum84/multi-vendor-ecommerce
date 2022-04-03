import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry, User, UserAddress } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface TagProductAttributes {
  product_id: string;
  tag_id: string;
}

export interface TagProductInstance extends Model<TagProductAttributes, TagProductAttributes>, TagProductAttributes {}

//--> Model attributes
export const TagProductModelAttributes: SequelizeAttributes<TagProductAttributes> = {
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
};
// --> Factory....
export function TagProductFactory(sequelize: Sequelize) {
  const TagProduct = <ModelStatic<TagProductInstance>>sequelize.define("TagProduct", TagProductModelAttributes as any, {
    timestamps: true,
    tableName: "TagProduct",
    freezeTableName: true,
  });

  TagProduct.associate = function (models: ModelRegistry) {
    const { TagProduct } = models;
  };

  return TagProduct;
}
