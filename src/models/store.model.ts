import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface StoreAttributes {
  store_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  slug: string;
  logo: string;
  address: string;
  country: string;
  description: string;
  verified: boolean;
  verified_at: Date;
}

interface StoreCreationAttributes extends Optional<StoreAttributes, "logo" | "description"> {}

export interface StoreInstance extends Model<StoreAttributes, StoreCreationAttributes>, StoreAttributes {}

//--> Model attributes
export const StoreModelAttributes: SequelizeAttributes<StoreAttributes> = {
  store_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: DataTypes.STRING,
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  logo: DataTypes.STRING,
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: "US",
  },
  description: DataTypes.STRING,
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_at: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
};
// --> Factory....
export function StoreFactory(sequelize: Sequelize) {
  const Store = <ModelStatic<StoreInstance>>sequelize.define("Store", StoreModelAttributes as any, {
    timestamps: true,
    tableName: "Store",
    freezeTableName: true,
  });

  Store.associate = function (models: ModelRegistry) {
    const { Store } = models;

    Store.belongsTo(models.User, {
      as: "owner",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
    Store.hasMany(models.SubOrders, {
      as: "orders",
      foreignKey: "store_id",
      sourceKey: "store_id",
    });
    Store.hasMany(models.Product, {
      as: "products",
      foreignKey: "store_id",
      sourceKey: "store_id",
    });
  };

  Store.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return Store;
}
