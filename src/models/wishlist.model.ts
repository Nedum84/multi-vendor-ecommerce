import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface WishlistAttributes {
  product_id: string;
  user_id: string;
}

interface WishlistInstance
  extends Model<WishlistAttributes, WishlistAttributes>,
    WishlistAttributes {}

//--> Model attributes
export const WishlistModelAttributes: SequelizeAttributes<WishlistAttributes> =
  {
    product_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  };
// --> Factory....
export function WishlistFactory(sequelize: Sequelize) {
  const Wishlist = <ModelStatic<WishlistInstance>>sequelize.define(
    "Wishlist",
    WishlistModelAttributes as any,
    {
      timestamps: true,
      tableName: "Wishlist",
      freezeTableName: true,
    }
  );

  Wishlist.associate = function (models: ModelRegistry) {
    const { Wishlist } = models;

    Wishlist.belongsTo(models.Product, {
      as: "product",
      foreignKey: "product_id",
      targetKey: "product_id",
    });
  };

  Wishlist.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return Wishlist;
}
