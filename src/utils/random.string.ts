import randomstring from "randomstring";
import { Transaction, UniqueConstraintError } from "sequelize";
import { ErrorResponse } from "../apiresponse/error.response";
import { ModelInstance, SequelizeModel } from "../typing/sequelize.typing";

// alphanumeric - [0-9 a-z A-Z]
// alphabetic - [a-z A-Z]
// numeric - [0-9]
// hex - [0-9 a-f]
// binary - [01]
// octal - [0-7]
// custom - any given characters

export const generateChars = (
  length = 12,
  charset = "alphanumeric",
  capitalization?: "uppercase" | "lowercase",
  readable = true
) => {
  return randomstring.generate({ length, readable, charset, capitalization });
};

export const genUniqueColId = async (
  model: SequelizeModel,
  column: string,
  length = 11,
  charset = "alphanumeric",
  capitalization?: "lowercase" | "uppercase",
  prefix = ""
) => {
  let exists;
  let string;
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
  let exists;
  let string;
  let isInitial = true;
  do {
    if (!isInitial) {
      string = `${slug}-${generateChars(length, "alphanumeric", "lowercase")}`;
    } else string = slug;

    isInitial = false;

    exists = await model.findOne({ where: { [column]: string } });
  } while (exists);

  return string;
};

/**
 *
 * @param model SequelizeModel
 * @param data payload
 * @param unique_column unique column
 * @returns create model
 */
export async function createModel<T extends ModelInstance>(
  model: SequelizeModel,
  data: any,
  unique_column: keyof T,
  transaction?: Transaction
): Promise<T> {
  // Unique ID table prefix

  return new Promise<T>(function (resolve, reject) {
    async function next() {
      data[unique_column] = generateChars(11, "alphanumeric");
      try {
        const create = await model.create(data, { transaction });
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
          return reject(new ErrorResponse(err));
        }
      }
    }
    next();
  });
}
