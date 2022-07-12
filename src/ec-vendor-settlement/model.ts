import { Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface VendorSettlementAttributes {
  settlement_id: string;
  store_order_ids: string[];
  amount: number;
  store_id: string;
  processed: boolean;
  processed_at: Date;
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
  store_order_ids: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  processed_at: DataTypes.DATE,
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

    VendorSettlement.belongsTo(models.Store, {
      as: "store",
      foreignKey: "store_id",
      targetKey: "store_id",
    });
  };

  VendorSettlement.prototype.toJSON = function () {
    const values = { ...this.get() };
    return values;
  };
  return VendorSettlement;
}
