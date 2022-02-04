import { SequelizeStorage, Umzug, memoryStorage } from "umzug";
import sequelize from "../../models";
import path from "path";

class UmzugInit {
  private readonly dirname;

  constructor(dirname: string) {
    this.dirname = dirname;

    this.init();
  }
  init() {
    const umzug = new Umzug({
      migrations: {
        // indicates the folder containing the migration .js files
        // path: path.join(__dirname, `../${this.dirname}`),
        glob: `${path.join(__dirname, `../${this.dirname}`)}/*.ts`,

        //multiple file location/extension(s)
        // glob: `
        //     {
        //       ${path.join(__dirname, `../${this.dirname}`)}/*.ts,
        //       ${path.join(__dirname, `../${this.dirname}`)}/*.js
        //   }`,

        // pattern: /\.ts|\.js$/,
        // inject sequelize's QueryInterface in the migrations
        // params: [sequelize],
        // params: [sequelize.getQueryInterface()],
      },

      // indicates that the migration data should be store in the database
      // itself through sequelize. The default configuration creates a table
      // storage: "sequelize",
      context: sequelize.getQueryInterface(),
      // storage: memoryStorage(),
      storage: new SequelizeStorage({ sequelize }),
      // storageOptions: {
      //   sequelize: sequelize,
      // },
      logger: console,
    });

    return umzug;
  }
}

export default UmzugInit;
