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
  city: string;
  state: string;
  country: string;
  description: string;
  rating: number;
  verified: boolean;
  verified_at: Date;
  disable_store: boolean; //admin can only change this...
  store_percentage: number; //Store's percentage share for every product sold
  //Extract to a new table later if you care
  settings: {
    auto_complete_order: boolean; //auto complete order on checkout
  };
  bank_details: {
    acc_name: string;
    acc_number: string;
    bank_code: string;
    bank_name: string;
  };
}

interface StoreCreationAttributes extends Optional<StoreAttributes, "logo" | "description" | "settings"> {}

export interface StoreInstance extends Model<StoreAttributes, StoreCreationAttributes>, StoreAttributes {}

//--> Model attributes
export const StoreModelAttributes: SequelizeAttributes<StoreAttributes> = {
  store_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
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
    allowNull: false,
    unique: true,
  },
  logo: DataTypes.STRING,
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: "US",
  },
  description: DataTypes.TEXT,
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_at: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
  disable_store: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  store_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 90,
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      auto_complete_order: true,
    },
  },
  bank_details: {
    type: DataTypes.JSONB,
    defaultValue: {
      acc_name: null,
      acc_nnumber: null,
      bank_code: null,
      bank_name: null,
    },
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
