import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { UserRoleStatus } from "./types";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { UserUtils } from "./user.utils";

export interface UserAttributes {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  role: UserRoleStatus;
  last_login: Date;
  suspended: boolean;
  password: string;
  bank_details: {
    acc_name: string;
    acc_number: string;
    bank_code: string;
    bank_name: string;
  };
}

interface UserCreationAttributes extends Optional<UserAttributes, "photo" | "suspended"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

//--> Model attributes
export const UserModelAttributes: SequelizeAttributes<UserAttributes> = {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: DataTypes.STRING,
  photo: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM,
    values: Object.values(UserRoleStatus),
    defaultValue: UserRoleStatus.USER,
  },
  last_login: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
  suspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
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
export function UserFactory(sequelize: Sequelize) {
  const User = <ModelStatic<UserInstance>>sequelize.define("User", UserModelAttributes as any, {
    timestamps: true,
    tableName: "User",
    freezeTableName: true,
    hooks: {
      beforeCreate: async (user: UserInstance) => {
        user.password = await UserUtils.hashPassword(user.password);
      },
    },
    defaultScope: {
      attributes: { exclude: ["password", "last_login"] },
    },
    scopes: {
      withSecretColumns: {
        attributes: { include: ["password"] },
      },
    },
  });

  User.associate = function (models: ModelRegistry) {
    const { User } = models;

    User.hasMany(models.UserWallet, {
      as: "funds",
      foreignKey: "user_id",
      sourceKey: "user_id",
    });
    User.hasMany(models.UserAddress, {
      as: "addresses",
      foreignKey: "user_id",
      sourceKey: "user_id",
    });
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };
  return User;
}
