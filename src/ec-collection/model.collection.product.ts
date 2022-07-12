import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface CollectionProductAttributes {
  product_id: string;
  collection_id: string;
}

export interface CollectionProductInstance
  extends Model<CollectionProductAttributes, CollectionProductAttributes>,
    CollectionProductAttributes {}

//--> Model attributes
export const CollectionProductModelAttributes: SequelizeAttributes<CollectionProductAttributes> = {
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  collection_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
};
// --> Factory....
export function CollectionProductFactory(sequelize: Sequelize) {
  const CollectionProduct = <ModelStatic<CollectionProductInstance>>sequelize.define(
    "CollectionProduct",
    CollectionProductModelAttributes as any,
    {
      timestamps: true,
      tableName: "CollectionProduct",
      freezeTableName: true,
    }
  );

  CollectionProduct.associate = function (models: ModelRegistry) {
    const { CollectionProduct } = models;
  };

  return CollectionProduct;
}
