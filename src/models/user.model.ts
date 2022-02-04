import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { UserRoleStatus } from "../enum/user.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { UserUtils } from "../utils/user.utils";

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
}

interface UserCreationAttributes extends Optional<UserAttributes, "photo" | "suspended"> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

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
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return User;
}
