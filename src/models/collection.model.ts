import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { CollectStatus } from "../enum/collection.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface CollectionAttributes {
  collection_id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: CollectStatus;
}

interface CollectionCreationAttributes extends Optional<CollectionAttributes, "collection_id" | "image" | "status"> {}

export interface CollectionInstance
  extends Model<CollectionAttributes, CollectionCreationAttributes>,
    CollectionAttributes {}

//--> Model attributes
export const CollectionModelAttributes: SequelizeAttributes<CollectionAttributes> = {
  collection_id: {
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
  description: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(CollectStatus),
    defaultValue: CollectStatus.PUBLISHED,
  },
};
// --> Factory....
export function CollectionFactory(sequelize: Sequelize) {
  const Collection = <ModelStatic<CollectionInstance>>sequelize.define("Collection", CollectionModelAttributes as any, {
    timestamps: true,
    tableName: "Collection",
    freezeTableName: true,
  });

  Collection.associate = function (models: ModelRegistry) {
    const { Collection } = models;
    Collection.belongsToMany(models.Product, {
      as: "products",
      through: models.CollectionProduct,
      foreignKey: "collection_id",
      targetKey: "product_id",
    });
  };

  return Collection;
}
