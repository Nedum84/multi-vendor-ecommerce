import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface FlashSalesAttributes {
  flash_sale_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  revoke: boolean;
}

export interface FlashSalesInstance extends Model<FlashSalesAttributes, FlashSalesAttributes>, FlashSalesAttributes {}

//--> Model attributes
export const FlashSalesModelAttributes: SequelizeAttributes<FlashSalesAttributes> = {
  flash_sale_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revoke: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};
// --> Factory....
export function FlashSalesFactory(sequelize: Sequelize) {
  const FlashSales = <ModelStatic<FlashSalesInstance>>sequelize.define("FlashSales", FlashSalesModelAttributes as any, {
    timestamps: true,
    tableName: "FlashSales",
    freezeTableName: true,
    indexes: [
      {
        fields: ["start_date", "end_date", "revoke"],
      },
    ],
  });

  FlashSales.associate = function (models: ModelRegistry) {
    const { FlashSales } = models;
  };

  FlashSales.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return FlashSales;
}
