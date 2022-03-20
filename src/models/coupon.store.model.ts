import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface CouponStoreAttributes {
  coupon_code: string;
  store_id: string;
}

export interface CouponStoreInstance
  extends Model<CouponStoreAttributes, CouponStoreAttributes>,
    CouponStoreAttributes {}

//--> Model attributes
export const CouponStoreModelAttributes: SequelizeAttributes<CouponStoreAttributes> = {
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
// --> Factory....
export function CouponStoreFactory(sequelize: Sequelize) {
  const CouponStore = <ModelStatic<CouponStoreInstance>>sequelize.define(
    "CouponStore",
    CouponStoreModelAttributes as any,
    {
      timestamps: false,
      tableName: "CouponStore",
      freezeTableName: true,
      defaultScope: {},
      scopes: {},
      indexes: [{ fields: ["coupon_code"] }],
    }
  );

  CouponStore.associate = function (models: ModelRegistry) {
    const { CouponStore } = models;

    CouponStore.belongsTo(models.Store, {
      as: "store",
      foreignKey: "store_id",
      targetKey: "store_id",
    });
    CouponStore.belongsTo(models.Coupon, {
      as: "coupon",
      foreignKey: "coupon_code",
      targetKey: "coupon_code",
    });
  };

  CouponStore.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return CouponStore;
}
