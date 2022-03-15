import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { CreditCodeType } from "../enum/credit.code.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { CreditCodeUserInstance } from "./credit.code.user.model";

export interface CreditCodeAttributes {
  credit_code: string;
  credit_type: CreditCodeType;
  title: string;
  amount: number;
  start_date: Date;
  end_date: Date;
  usage_limit: number;
  created_by: string;
  revoke: boolean;
}

interface CreditCodeCreationAttributes extends Optional<CreditCodeAttributes, "revoke"> {}

export interface CreditCodeInstance
  extends Model<CreditCodeAttributes, CreditCodeCreationAttributes>,
    CreditCodeAttributes {
  users: CreditCodeUserInstance[];
}

//--> Model attributes
export const CreditCodeModelAttributes: SequelizeAttributes<CreditCodeAttributes> = {
  credit_code: {
    type: DataTypes.STRING,
    comment: "Class Comment Id",
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  credit_type: {
    type: DataTypes.ENUM,
    values: Object.values(CreditCodeType),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: DataTypes.DATE,
  usage_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  revoke: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};
// --> Factory....
export function CreditCodeFactory(sequelize: Sequelize) {
  const CreditCode = <ModelStatic<CreditCodeInstance>>sequelize.define("CreditCode", CreditCodeModelAttributes as any, {
    timestamps: true,
    tableName: "CreditCode",
    freezeTableName: true,
    defaultScope: {},
    scopes: {
      basic: {
        attributes: [],
      },
    },
  });

  CreditCode.associate = function (models: ModelRegistry) {
    const { CreditCode } = models;

    CreditCode.belongsTo(models.User, {
      as: "user",
      foreignKey: "created_by",
      targetKey: "user_id",
    });
    CreditCode.hasMany(models.CreditCodeUser, {
      as: "users",
      foreignKey: "credit_code",
      sourceKey: "credit_code",
    });
  };

  CreditCode.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return CreditCode;
}
