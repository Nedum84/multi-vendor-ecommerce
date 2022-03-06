import { FindOptions } from "sequelize";
import { CreditCode, CreditCodeUser } from "../models";
import { genUniqueColId } from "./random.string";

class CreditCodeUtils {
  /**
   * Generates Unique credit code
   * @returns credit code
   */
  static generateCreditCode = async () => {
    return await genUniqueColId(CreditCode, "credit_code", 12, "alphanumeric", "uppercase");
  };

  static sequelizeFindOptions = (paginate?: { limit: number; offset: number }) => {
    const options: FindOptions = {
      ...(paginate ?? {}),
      subQuery: false,
      include: [{ model: CreditCodeUser, as: "users" }],
    };
    return options;
  };
}

export default CreditCodeUtils;
