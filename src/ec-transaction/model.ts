import { Model, Optional, DataTypes, Sequelize } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { TransactionOperation } from "./types";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { isTest } from "../ec-utils/env.utils";

export interface TransactionAttributes {
  transaction_id: string;
  user_id: string;
  amount: number;
  desc: string;
  reference_id: string;
  operation: TransactionOperation;
  created_at?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, "transaction_id"> {}

export interface TransactionInstance
  extends Model<TransactionAttributes, TransactionCreationAttributes>,
    TransactionAttributes {}

//--> Model attributes
const TransactionModelAttributes: SequelizeAttributes<TransactionAttributes> = {
  transaction_id: {
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
  desc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reference_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operation: {
    type: DataTypes.ENUM,
    values: Object.values(TransactionOperation),
    allowNull: false,
  },
};
export function TransactionFactory(sequelize: Sequelize) {
  const Transaction = <ModelStatic<TransactionInstance>>sequelize.define(
    "Transaction",
    TransactionModelAttributes as any,
    {
      timestamps: true,
      tableName: "Transaction",
      freezeTableName: true,
      createdAt: "created_at",
      updatedAt: false,
      deletedAt: "deleted_at",
      defaultScope: {},
      scopes: {},
      indexes: [
        {
          fields: ["user_id"],
        },
        { fields: ["user_id", "operation"] },
      ],
    }
  );

  Transaction.associate = function (models: ModelRegistry) {
    const { Transaction } = models;

    Transaction.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };
  Transaction.prototype.toJSON = function () {
    const values = { ...this.get() };
    const exclude = ["version", "id"];
    exclude.forEach((e) => delete values[e]);
    return values;
  };
  Transaction.addHook("afterSave", async (transaction) => {
    if (!isTest()) {
      const get = transaction.get();
      const id = get.transaction_id;

      // Add to the secondary backup db
      // Add to elasticsearch
      const payload = {
        ...get,
      };
    }
  });
  return Transaction;
}
