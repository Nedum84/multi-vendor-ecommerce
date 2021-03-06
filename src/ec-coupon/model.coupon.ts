import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { CouponType } from "./types";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { CouponProductInstance } from "./model.product";
import { CouponStoreInstance } from "./model.store";
import { CouponUserInstance } from "./model.user";
import { CouponCategoryInstance } from "./model.category";

export interface CouponAttributes {
  coupon_code: string;
  coupon_type: CouponType;
  title: string;
  start_date: Date;
  end_date: Date;
  product_qty_limit: number;
  usage_limit: number;
  usage_limit_per_user: number;
  created_by: string;
  /** percentage discount(<100) FOR {CouponType=PERCENTAGE} or coupon amount FOR {CouponType=FIXED_AMOUNT}  */
  coupon_discount: number;
  max_coupon_amount: number; // max amount that this coupon can discount to(ie coupon cap) FOR {CouponType=PERCENTAGE}
  min_spend: number; // min amount before you can use this coupon
  max_spend: number; // max amount before you can use this coupon
  enable_free_shipping: boolean;
  // whether this coupon is on vendors or the company
  // OR is vendor the one to bear this coupon discount or the company
  // to be used during settlement to know how much to settle the vendors
  vendor_bears_discount: boolean;
  revoke: boolean;
}

interface CouponCreationAttributes extends Optional<CouponAttributes, "revoke"> {}

export interface CouponInstance
  extends Model<CouponAttributes, CouponCreationAttributes>,
    CouponAttributes {
  products: CouponProductInstance[];
  stores: CouponStoreInstance[];
  users: CouponUserInstance[];
  categories: CouponCategoryInstance[];
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
  coupon_discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_coupon_amount: DataTypes.INTEGER,
  min_spend: DataTypes.INTEGER,
  max_spend: DataTypes.INTEGER,
  enable_free_shipping: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  vendor_bears_discount: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  revoke: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};
// --> Factory....
export function CouponFactory(sequelize: Sequelize) {
  const Coupon = <ModelStatic<CouponInstance>>sequelize.define(
    "Coupon",
    CouponModelAttributes as any,
    {
      timestamps: true,
      tableName: "Coupon",
      freezeTableName: true,
      defaultScope: {},
      scopes: {
        basic: {
          attributes: [],
        },
      },
      validate: {
        discountOrFixedPriceRequired: function () {
          if (this.coupon_discount == null && this.fixed_price_coupon_amount == null) {
            throw new Error("Percentage discount or coupon amount is required");
          }
        },
      },
    }
  );

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
    Coupon.hasMany(models.CouponCategory, {
      as: "categories",
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
