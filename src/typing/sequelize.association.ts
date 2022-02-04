import { Model } from "sequelize/types";

interface ISequelizeAssociatable<T> extends Model<any, any> {
  associate(reg: T): void;
}
export function isAssociatable<T>(model: {
  associate?: Function;
}): model is ISequelizeAssociatable<T> {
  return typeof model.associate === "function";
}
