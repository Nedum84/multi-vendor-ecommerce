import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { CouponType } from "../enum/coupon.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { ProductInstance } from "./product.model";
import { StoreInstance } from "./store.model";
import { UserInstance } from "./user.model";

export interface CouponAttributes {
  coupon_code: string;
  coupon_type: CouponType;
  title: string;
  start_date: Date;
  end_date: Date;
  usage_limit: number;
  usage_limit_per_user: number;
  total_used: number;
  min_product_price: number;
  created_by: string;
  percentage_discount: number;
  revoke: boolean;
}

interface CouponCreationAttributes extends Optional<CouponAttributes, "revoke"> {}

export interface CouponInstance extends Model<CouponAttributes, CouponCreationAttributes>, CouponAttributes {
  products: ProductInstance[];
  stores: StoreInstance[];
  users: UserInstance[];
}

//--> Model attributes
export const CouponModelAttributes: SequelizeAttributes<CouponAttributes> = {
  coupon_code: {
    type: DataTypes.STRING,
    comment: "Class Comment Id",
    allowNull: false,
    unique: true,
  },
  coupon_type: {
    type: DataTypes.ENUM,
    values: Object.values(CouponType),
    allowNull: false,
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
  usage_limit_per_user: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  total_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  min_product_price: DataTypes.BIGINT,
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  percentage_discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
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
      foreignKey: "user_id",
      targetKey: "created_by",
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
