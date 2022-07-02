import { BuildOptions, Op } from "sequelize";
import { DataTypeAbstract, ModelAttributeColumnOptions } from "sequelize";
import { Model } from "sequelize";

type SequelizeAttribute = string | DataTypeAbstract | ModelAttributeColumnOptions;

export type SequelizeAttributes<T extends { [key: string]: any }> = {
  [P in keyof T]: SequelizeAttribute;
};

export type SequelizeModel = typeof Model & {
  new (values?: object, options?: BuildOptions): Model;
};

export type ModelInstance = Model<any, any>;

/**
 * For building model instance used in creating model in the model definition
 */
export type ModelStatic<T> = typeof Model & {
  new (values?: object, options?: BuildOptions): T;
  associate: (models: any) => any;
  setDataValue: (key: any, val: any) => void;
};

/**
 * Sequelize Where options attributes
 */
export type WhereFilters<T> = {
  [K in keyof T]?: T[K];
} & {
  [Op.or]?: {
    [K in keyof T]?: any;
  }[];
} & {
  [Op.and]?: {
    [K in keyof T]?: any;
  }[];
};

export type WhereFiltersOptimized<T> = [WhereFilters<T>];

interface ISequelizeAssociatable<T> extends Model<any, any> {
  associate(reg: T): void;
}
export function isAssociatable<T>(model: {
  associate?: Function;
}): model is ISequelizeAssociatable<T> {
  return typeof model.associate === "function";
}

export interface Paginate {
  limit: number;
  offset: number;
}
