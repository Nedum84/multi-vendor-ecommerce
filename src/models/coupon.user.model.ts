import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface CouponUserAttributes {
  coupon_code: string;
  user_id: string;
}

export interface CouponUserInstance extends Model<CouponUserAttributes, CouponUserAttributes>, CouponUserAttributes {}

//--> Model attributes
export const CouponUserModelAttributes: SequelizeAttributes<CouponUserAttributes> = {
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
// --> Factory....
export function CouponUserFactory(sequelize: Sequelize) {
  const CouponUser = <ModelStatic<CouponUserInstance>>sequelize.define("CouponUser", CouponUserModelAttributes as any, {
    timestamps: false,
    tableName: "CouponUser",
    freezeTableName: true,
    defaultScope: {},
    scopes: {},
    indexes: [{ fields: ["coupon_code"] }],
  });

  CouponUser.associate = function (models: ModelRegistry) {
    const { CouponUser } = models;

    CouponUser.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
    CouponUser.belongsTo(models.Coupon, {
      as: "coupon",
      foreignKey: "coupon_code",
      targetKey: "coupon_code",
    });
  };

  CouponUser.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return CouponUser;
}
