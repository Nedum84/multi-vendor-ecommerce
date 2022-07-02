"use strict";

import { Sequelize } from "sequelize";
import {
  DataTypes,
  DATE,
  QueryInterface,
  ModelAttributes,
  Model,
  QueryInterfaceCreateTableOptions,
  QueryInterfaceIndexOptions,
} from "sequelize";

interface Params {
  name: string;
  data: ModelAttributes<Model<any, any>, any>;
  options: QueryInterfaceCreateTableOptions;
}
[];
interface MigrationCommands {
  fn: "createTable" | "addIndex";
  // params: [string, { [k: string]: any }, {}];
  params: [string, ModelAttributes<Model<any, any>, any>, {}];
}
var migrationCommands: MigrationCommands[] = [];

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
