import { Dialect, Options } from "sequelize";
import config from "../../config/config";

interface DBStages {
  test: Options;
  development: Options;
  production: Options;
}
const dbConfig = {
  development: {
    database: config.DB_NAME!,
    username: config.DB_USERNAME!,
    password: config.DB_PASSWORD!,
    host: config.DB_HOST,
    dialect: "postgres" as Dialect,
    port: Number(config.DB_PORT) || 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    database: config.DB_TEST_NAME,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    host: config.DB_HOST,
    dialect: "postgres" as Dialect,
    logging: false,
    port: Number(config.DB_PORT) || 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    database: config.DB_NAME,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    host: config.DB_HOST,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

export = dbConfig;
