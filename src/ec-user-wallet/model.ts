import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { isTest } from "../ec-utils/env.utils";

export interface UserWalletAttributes {
  user_id: string;
  balance: number;
}

export interface UserWalletInstance
  extends Model<UserWalletAttributes, UserWalletAttributes>,
    UserWalletAttributes {}

//--> Model attributes
export const UserWalletModelAttributes: SequelizeAttributes<UserWalletAttributes> = {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
};

// --> Factory....
export function UserWalletFactory(sequelize: Sequelize) {
  const UserWallet = <ModelStatic<UserWalletInstance>>sequelize.define(
    "UserWallet",
    UserWalletModelAttributes as any,
    {
      timestamps: true,
      tableName: "UserWallet",
      freezeTableName: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      defaultScope: {},
      scopes: {},
    }
  );

  UserWallet.associate = function (models: ModelRegistry) {
    const { UserWallet } = models;

    UserWallet.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  UserWallet.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  UserWallet.addHook("afterSave", async (wallet) => {
    if (!isTest()) {
      const get = wallet.get();
      const id = get.user_id;

      // Add to the secondary backup db
      // Add to elasticsearch
      const payload = {
        ...get,
      };
    }
  });
  return UserWallet;
}
