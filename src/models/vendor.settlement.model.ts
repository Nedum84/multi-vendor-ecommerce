import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface VendorSettlementAttributes {
  settlement_id: string;
  sub_order_ids: string[];
  total: number;
  store_id: string;
}

export interface VendorSettlementInstance
  extends Model<VendorSettlementAttributes, VendorSettlementAttributes>,
    VendorSettlementAttributes {}

//--> Model attributes
export const VendorSettlementModelAttributes: SequelizeAttributes<VendorSettlementAttributes> = {
  settlement_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  sub_order_ids: {
    type: DataTypes.ARRAY,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
// --> Factory....
export function VendorSettlementFactory(sequelize: Sequelize) {
  const VendorSettlement = <ModelStatic<VendorSettlementInstance>>sequelize.define(
    "VendorSettlement",
    VendorSettlementModelAttributes as any,
    {
      timestamps: true,
      tableName: "VendorSettlement",
      freezeTableName: true,
    }
  );

  VendorSettlement.associate = function (models: ModelRegistry) {
    const { VendorSettlement } = models;
  };

  VendorSettlement.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return VendorSettlement;
}
