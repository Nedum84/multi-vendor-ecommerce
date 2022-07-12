import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface CouponProductAttributes {
  coupon_code: string;
  product_id: string;
}

export interface CouponProductInstance
  extends Model<CouponProductAttributes, CouponProductAttributes>,
    CouponProductAttributes {}

//--> Model attributes
export const CouponProductModelAttributes: SequelizeAttributes<CouponProductAttributes> = {
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
};
// --> Factory....
export function CouponProductFactory(sequelize: Sequelize) {
  const CouponProduct = <ModelStatic<CouponProductInstance>>sequelize.define(
    "CouponProduct",
    CouponProductModelAttributes as any,
    {
      timestamps: false,
      tableName: "CouponProduct",
      freezeTableName: true,
      defaultScope: {},
      indexes: [{ fields: ["coupon_code"] }],
    }
  );

  CouponProduct.associate = function (models: ModelRegistry) {
    const { CouponProduct } = models;

    CouponProduct.belongsTo(models.Product, {
      as: "product",
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    CouponProduct.belongsTo(models.Coupon, {
      as: "coupon",
      foreignKey: "coupon_code",
      targetKey: "coupon_code",
    });
  };

  CouponProduct.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return CouponProduct;
}
