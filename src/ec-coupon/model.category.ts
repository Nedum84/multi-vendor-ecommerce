import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface CouponCategoryAttributes {
  coupon_code: string;
  category_id: string;
}

export interface CouponCategoryInstance
  extends Model<CouponCategoryAttributes, CouponCategoryAttributes>,
    CouponCategoryAttributes {}

//--> Model attributes
export const CouponCategoryModelAttributes: SequelizeAttributes<CouponCategoryAttributes> = {
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
};
// --> Factory....
export function CouponCategoryFactory(sequelize: Sequelize) {
  const CouponCategory = <ModelStatic<CouponCategoryInstance>>sequelize.define(
    "CouponCategory",
    CouponCategoryModelAttributes as any,
    {
      timestamps: false,
      tableName: "CouponCategory",
      freezeTableName: true,
      defaultScope: {},
      scopes: {},
      indexes: [{ fields: ["coupon_code"] }],
    }
  );

  CouponCategory.associate = function (models: ModelRegistry) {
    const { CouponCategory } = models;

    CouponCategory.belongsTo(models.Category, {
      as: "category",
      foreignKey: "category_id",
      targetKey: "category_id",
    });
    CouponCategory.belongsTo(models.Coupon, {
      as: "coupon",
      foreignKey: "coupon_code",
      targetKey: "coupon_code",
    });
  };

  CouponCategory.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return CouponCategory;
}
