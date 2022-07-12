import sequelize, { CreditCode, CreditCodeUser } from "../ec-models";
import { Op } from "sequelize";
import { Request } from "express";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { isAdmin } from "../ec-apps/app-admin/roles.service";
import { CreditCodeAttributes } from "./credit.code.model";
import { CreditCodeUserAttributes } from "./credit.code.user.model";
import { CreditCodeType } from "./types";
import { NotFoundError } from "../ec-api-response/not.found.error";
import CreditCodeUtils from "./credit.utils";
import { getPaginate } from "../ec-models/utils";

//credit redeem using credit code
const create = async (req: Request) => {
  const { user_id, role } = req.user!;
  const body: CreditCodeAttributes & { users: CreditCodeUserAttributes[] } = req.body;
  const { credit_type, credit_code } = body;
  body.created_by = user_id;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  if (credit_type == CreditCodeType.USER && body.users.length == 0) {
    throw new BadRequestError("user(user_id) is required for USER CREDIT TYPE");
  }

  //--> Check(validate) code exist
  await validateCreditCodeExist(credit_code);

  try {
    await sequelize.transaction(async (transaction) => {
      //--> Create code
      const code = await CreditCode.create(body, { transaction });

      if (credit_type === CreditCodeType.USER) {
        const payload = body.users.map(({ user_id }) => ({
          user_id,
          credit_code,
        }));
        await CreditCodeUser.bulkCreate(payload, { transaction });
      }
    });
  } catch (error: any) {
    throw new BadRequestError(error);
  }

  return findByCreditCodeCode(credit_code);
};

/**  Generate credit */
const generateCreditCode = async () => {
  return CreditCodeUtils.generateCreditCode();
};
/**  Destroy credit */
const revokeCreditCode = async (req: Request) => {
  const { user_id, role } = req.user!;

  const { credit_code } = req.body;
  const credit = await findByCreditCodeCode(credit_code);

  if (credit.created_by !== user_id && !isAdmin(role)) {
    throw new ForbiddenError("Not authorized to revoke this credit");
  }

  credit.revoke = true;
  await credit.save();
  return findByCreditCodeCode(credit_code);
};
//Validate if code already exist
const validateCreditCodeExist = async (credit_code: string) => {
  //--> Check code exist
  const checkExist = await CreditCode.findOne({ where: { credit_code } });
  if (checkExist) {
    throw new BadRequestError(`Credit not available`);
  }

  return "Credit is available for use";
};
//--> find code by code
const findByCreditCodeCode = async (credit_code: string) => {
  const code = await CreditCode.findOne({
    where: { credit_code },
    ...CreditCodeUtils.sequelizeFindOptions(),
  });
  if (!code) {
    throw new NotFoundError("Credit not found");
  }
  return code;
};

//find all
const findAll = async (req: Request) => {
  const { limit, offset } = getPaginate(req.query);
  const { role } = req.user!;
  const { credit_type, search_query } = req.query as any;

  if (!isAdmin(role)) {
    throw new ForbiddenError("Not authorized to access this resources");
  }
  const where: { [k: string]: any } = {};
  if (credit_type) {
    where.credit_type = credit_type;
  }
  if (search_query) {
    where[Op.or as any] = [
      { credit_code: { [Op.iLike]: `%${search_query}%` } },
      { title: { [Op.iLike]: `%${search_query}%` } },
    ];
  }
  const coupons = await CreditCode.findAll({
    where,
    ...CreditCodeUtils.sequelizeFindOptions({ limit, offset }),
  });

  return coupons;
};

export default {
  create,
  generateCreditCode,
  revokeCreditCode,
  validateCreditCodeExist,
  findByCreditCodeCode,
  findAll,
};
