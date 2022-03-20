import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { CouponApplyFor, CouponType } from "../enum/coupon.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { CouponProductInstance } from "./coupon.product.model";
import { CouponStoreInstance } from "./coupon.store.model";
import { CouponUserInstance } from "./coupon.user.model";

export interface CouponAttributes {
  coupon_code: string;
  coupon_apply_for: CouponApplyFor;
  coupon_type: CouponType;
  title: string;
  start_date: Date;
  end_date: Date;
  product_qty_limit: number;
  usage_limit: number;
  usage_limit_per_user: number;
  created_by: string;
  percentage_discount: number;
  max_coupon_amount: number;
  revoke: boolean;
}

interface CouponCreationAttributes extends Optional<CouponAttributes, "revoke"> {}

export interface CouponInstance extends Model<CouponAttributes, CouponCreationAttributes>, CouponAttributes {
  products: CouponProductInstance[];
  stores: CouponStoreInstance[];
  users: CouponUserInstance[];
}

//--> Model attributes
export const CouponModelAttributes: SequelizeAttributes<CouponAttributes> = {
  coupon_code: {
    type: DataTypes.STRING,
    comment: "Class Comment Id",
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  coupon_apply_for: {
    type: DataTypes.ENUM,
    values: Object.values(CouponApplyFor),
    allowNull: false,
  },
  coupon_type: {
    type: DataTypes.ENUM,
    values: Object.values(CouponType),
    defaultValue: CouponType.PERCENTAGE,
  },
  title: {
    type: DataTypes.STRING,
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
  product_qty_limit: {
    type: DataTypes.INTEGER,
  },
  usage_limit_per_user: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  percentage_discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_coupon_amount: DataTypes.INTEGER,
  revoke: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};
// --> Factory....
export function CouponFactory(sequelize: Sequelize) {
  const Coupon = <ModelStatic<CouponInstance>>sequelize.define("Coupon", CouponModelAttributes as any, {
    timestamps: true,
    tableName: "Coupon",
    freezeTableName: true,
    defaultScope: {},
    scopes: {
      basic: {
        attributes: [],
      },
    },
  });

  Coupon.associate = function (models: ModelRegistry) {
    const { Coupon } = models;

    Coupon.belongsTo(models.User, {
      as: "user",
      foreignKey: "created_by",
      targetKey: "user_id",
    });
    Coupon.hasMany(models.CouponProduct, {
      as: "products",
      foreignKey: "coupon_code",
      sourceKey: "coupon_code",
    });
    Coupon.hasMany(models.CouponStore, {
      as: "stores",
      foreignKey: "coupon_code",
      sourceKey: "coupon_code",
    });
    Coupon.hasMany(models.CouponUser, {
      as: "users",
      foreignKey: "coupon_code",
      sourceKey: "coupon_code",
    });
  };

  Coupon.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return Coupon;
}
