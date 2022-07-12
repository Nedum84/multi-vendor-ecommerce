import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { ProductVariationInstance } from "../ec-product-variation/model";

export interface CartAttributes {
  user_id: string;
  variation_id: string;
  store_id: string;
  qty: number;
}

export interface CartInstance extends Model<CartAttributes, CartAttributes>, CartAttributes {
  variation: ProductVariationInstance;
  final_price: number;
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
  Cart.afterFind((findResult) => {
    if (!findResult) return;
    if (!(findResult instanceof Array)) findResult = [findResult];

    // Set final price for product variation
    for (const cart of findResult) {
      if (!cart.variation) continue;
      const { flash_discount, discount, price } = cart.variation;
      let finalPrice = price;
      if (flash_discount) {
        finalPrice = flash_discount.price;
      } else if (discount) {
        finalPrice = discount.price;
      }
      // @ts-ignore
      cart.variation.setDataValue("final_price", finalPrice);
    }
  });
  return Cart;
}
