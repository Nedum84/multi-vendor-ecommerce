import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { ProductVariationInstance } from "./product.variation.model";

export interface CartAttributes {
  user_id: string;
  variation_id: string;
  store_id: string;
  qty: number;
}

export interface CartInstance extends Model<CartAttributes, CartAttributes>, CartAttributes {
  variation: ProductVariationInstance;
}

//--> Model attributes
export const CartModelAttributes: SequelizeAttributes<CartAttributes> = {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  variation_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};
// --> Factory....
export function CartFactory(sequelize: Sequelize) {
  const Cart = <ModelStatic<CartInstance>>sequelize.define("Cart", CartModelAttributes as any, {
    timestamps: true,
    tableName: "Cart",
    freezeTableName: true,
  });

  Cart.associate = function (models: ModelRegistry) {
    const { Cart } = models;

    Cart.belongsTo(models.ProductVariation, {
      as: "variation",
      foreignKey: "variation_id",
      targetKey: "variation_id",
    });
    Cart.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
    Cart.belongsTo(models.Store, {
      as: "store",
      foreignKey: "store_id",
      targetKey: "store_id",
    });
  };

  Cart.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return Cart;
}
