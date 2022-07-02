import sequelize from "../ec-models";
// See: https://jestjs.io/docs/configuration#setupfilesafterenv-array

// Prevent NODE_ENV from being override by something else. This is important
// because database config for integration testing is relying on this value.
// https://github.com/oozou/sbth-cms-api/blob/8250a0cf56b30c2de96dfd36a857cd7be3425d5e/src/sb-databases/config.ts#L92-L102
process.env.NODE_ENV = "test";

// ---> THIS FILE RUNS ONLY ONCE
export default async () => {
  await sequelize
    .sync({ force: true })
    .catch((e) => {
      console.log(e);
      process.exit(1);
    })
    .then((r) => console.log("db connected"));
};
