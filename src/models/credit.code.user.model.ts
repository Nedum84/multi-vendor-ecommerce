import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface CreditCodeUserAttributes {
  credit_code: string;
  user_id: string;
}

export interface CreditCodeUserInstance
  extends Model<CreditCodeUserAttributes, CreditCodeUserAttributes>,
    CreditCodeUserAttributes {}

//--> Model attributes
export const CreditCodeUserModelAttributes: SequelizeAttributes<CreditCodeUserAttributes> = {
  credit_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
// --> Factory....
export function CreditCodeUserFactory(sequelize: Sequelize) {
  const CreditCodeUser = <ModelStatic<CreditCodeUserInstance>>sequelize.define(
    "CreditCodeUser",
    CreditCodeUserModelAttributes as any,
    {
      timestamps: false,
      tableName: "CreditCodeUser",
      freezeTableName: true,
      defaultScope: {},
      scopes: {},
    }
  );

  CreditCodeUser.associate = function (models: ModelRegistry) {
    const { CreditCodeUser } = models;

    CreditCodeUser.belongsTo(models.CreditCode, {
      as: "credit",
      foreignKey: "credit_code",
      targetKey: "credit_code",
    });
  };

  CreditCodeUser.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return CreditCodeUser;
}
