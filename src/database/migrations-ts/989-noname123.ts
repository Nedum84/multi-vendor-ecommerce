"use strict";

import { Sequelize } from "sequelize";
import { DataTypes, DATE, QueryInterface, ModelAttributes, Model } from "sequelize";

interface MigrationCommands {
  fn: "createTable" | "addIndex";
  // params: [string, { [k: string]: any }, {}];
  params: [string, ModelAttributes<Model<any, any>, any>, {}];
}
var migrationCommands: MigrationCommands[] = [
  // var migrationCommands = [
  {
    fn: "createTable",
    params: [
      "AppSettings",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        d_key: {
          type: DataTypes.STRING,
        },
        value: {
          type: DataTypes.TEXT,
        },
        last_updated_by: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {},
    ],
  },
];

const dateDefault: ModelAttributes<Model<any, any>, any> = {
  createdAt: {
    type: DATE,
    field: "createdAt",
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    allowNull: false,
  },
  updatedAt: {
    type: DATE,
    field: "updatedAt",
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    allowNull: false,
  },
  deletedAt: {
    type: DATE,
    field: "deletedAt",
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
};

function up({ queryInterface }: { queryInterface: QueryInterface }) {
  var index = 0;
  return new Promise<void>(function (resolve, reject) {
    function next() {
      if (index < migrationCommands.length) {
        let command = migrationCommands[index];
        console.log("[#" + index + "] execute: " + command.fn);
        index++;
        // @ts-ignore
        command.params[1] = { ...command.params[1], ...dateDefault };
        // @ts-ignore
        queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
      } else resolve();
    }
    next();
  });
}

async function down({ queryInterface }: { queryInterface: QueryInterface }) {}

export default { up, down };
