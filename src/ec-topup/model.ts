import { Sequelize } from "sequelize";
import { Model, Optional, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { isTest } from "../ec-utils/env.utils";
import { PaymentChannel } from "./types";

export interface TopupAttributes {
  topup_id: string;
  user_id: string;
  amount: number;
  transaction_fee: number;
  payment_channel: PaymentChannel;
  payment_reference: string;
  action_performed_by: string;
  created_at?: Date;
}

interface TopupCreationAttributes extends Optional<TopupAttributes, "topup_id"> {}

export interface TopupInstance
  extends Model<TopupAttributes, TopupCreationAttributes>,
    TopupAttributes {}

//--> Model attributes
export const TopupModelAttributes: SequelizeAttributes<TopupAttributes> = {
  topup_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  transaction_fee: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  payment_channel: {
    type: DataTypes.ENUM,
    values: Object.values(PaymentChannel),
    allowNull: false,
  },
  payment_reference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  action_performed_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

// --> Factory....
export function TopupFactory(sequelize: Sequelize) {
  const Topup = <ModelStatic<TopupInstance>>sequelize.define("Topup", TopupModelAttributes as any, {
    timestamps: true,
    tableName: "Topup",
    freezeTableName: true,
    createdAt: "created_at",
    updatedAt: false,
    deletedAt: "deleted_at",
    indexes: [{ fields: ["user_id"] }],
  });

  Topup.associate = function (models: ModelRegistry) {
    const { Topup } = models;

    Topup.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  Topup.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.created_at;
    delete values.updated_at;
    return values;
  };
  Topup.addHook("afterSave", async (topup) => {
    if (!isTest()) {
      const get = topup.get();
      const id = get.topup_id;

      // Add to the secondary backup db
      // Add to elasticsearch
      const payload = {
        ...get,
      };
    }
  });
  return Topup;
}
