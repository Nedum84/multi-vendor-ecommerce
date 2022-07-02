import { ModelInstance, Paginate, SequelizeModel } from "./types";
import { Transaction, UniqueConstraintError } from "sequelize";
import { generateChars } from "../ec-utils/random.string";

export function getPaginate(query: any): Paginate {
  const { perPage = 10, page = 1 } = query;
  return {
    limit: perPage,
    offset: (page - 1) * perPage,
  };
}

export const genUniqueColId = async <T = object>(
  model: SequelizeModel,
  column: keyof T,
  length = 11,
  charset = "alphanumeric",
  capitalization?: "lowercase" | "uppercase",
  prefix = ""
) => {
  let exists: ModelInstance | null;
  let string: string | null;
  do {
    string = `${prefix}${generateChars(length, charset, capitalization)}`;
    exists = await model.findOne({ where: { [column]: string } });
  } while (exists);

  return string;
};

/**
 * generate unique column slug
 * @param model SequelizeModel
 * @param column unique column
 * @param slug slug
 * @returns
 */
export const genSlugColId = async (model: SequelizeModel, column: string, slug: string) => {
  let exists: ModelInstance | null;
  let string: string | null;
  let isInitial = true;
  do {
    if (!isInitial) {
      string = `${slug}-${generateChars(5, "alphanumeric", "lowercase")}`;
    } else string = slug;

    isInitial = false;

    exists = await model.findOne({ where: { [column]: string } });
  } while (exists);

  return string;
};

export async function createModel<T extends ModelInstance = any, Attributes = T>(
  model: SequelizeModel,
  data: { [K in keyof Attributes]?: Attributes[K] },
  unique_column: keyof Attributes,
  options?: {
    transaction?: Transaction;
    returning?: boolean;
    char_length?: number;
  }
): Promise<T> {
  return new Promise<T>(function (resolve, reject) {
    async function next() {
      data[unique_column as any] = generateChars(options?.char_length ?? 10, "alphanumeric");
      try {
        const create = await model.create(data as any, {
          transaction: options?.transaction,
          returning: options?.returning,
        });
        resolve(create as T);
      } catch (error: any) {
        //Check for sequlize unique constraint error
        const isConstrantError =
          error instanceof UniqueConstraintError || error.name === "SequelizeUniqueConstraintError";

        if (isConstrantError) {
          next(); // continue...
        } else {
          // stop exceptions(Other error )
          const err = error.message ?? error.name ?? error;
          console.error("Error1", error);

          return reject(new Error(err));
        }
      }
    }
    next();
  });
}
