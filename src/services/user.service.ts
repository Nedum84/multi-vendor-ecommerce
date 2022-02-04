import { Request } from "express";
import { ErrorResponse } from "../apiresponse/error.response";
import sequelize, { User, UserWallet } from "../models";
import { UserAttributes, UserInstance } from "../models/user.model";
import { createModel, genUniqueColId } from "../utils/random.string";
import { FundingTypes } from "../enum/payment.enum";
import userWalletService from "./user.wallet.service";
import { NotFoundError } from "../apiresponse/not.found.error";
import { isAdmin } from "../utils/admin.utils";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { Helpers } from "../utils/helpers";
import { Op } from "sequelize/dist";

const create = async (body: UserAttributes) => {
  const { email } = body;

  if (email) {
    // Check if Email is taken
    const isEmailTaken = await User.findOne({
      where: { email },
    });
    if (!!isEmailTaken) {
      throw new ErrorResponse("Email already taken");
    }
  }

  let user: UserInstance | null;
  try {
    await sequelize.transaction(async (t) => {
      //create user
      const user = await createModel<UserInstance>(User, body, "user_id", t);
      const { user_id } = user;

      //Add Registration Coins Bonus
      const payment_id = await genUniqueColId(UserWallet, "payment_id", 14);
      const amount = 50; //USD

      await userWalletService.createCredit(user_id, amount, FundingTypes.REG_BONUS, payment_id, t);
    });
  } catch (error: any) {
    throw new ErrorResponse(error);
  }
  return user!;
};
const update = async (req: Request) => {
  const { user_id } = req.user!;
  const body: UserAttributes = req.body;

  const user = await findById(user_id);

  Object.assign(user, body);
  await user.save();
  return user.reload();
};

const adminUpdateUser = async (req: Request) => {
  const { user_id, role } = req.user!;
  const body: UserAttributes = req.body;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const user = await findById(user_id);
  Object.assign(user, body);
  await user.save();
  return user.reload();
};

const findById = async (user_id: string) => {
  const user = await User.findOne({ where: { user_id } });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

const findMe = async (user_id: string) => {
  const user = await User.findOne({ where: { user_id } });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

const findByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

const getSecureUserByEmail = async (email: string) => {
  const user = await User.scope("withSecretColumns").findOne({
    where: { email },
  });
  return user;
};

const findAll = async (req: Request) => {
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { user_id, email, phone, suspended, search_query } = req.query as any;
  const where: { [k: string]: any } = {};

  const { role } = req.user!;
  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  if (user_id) {
    where.user_id = user_id;
  }
  if (email) {
    where.email = email;
  }
  if (phone) {
    where.phone = phone;
  }
  if (suspended) {
    where.suspended = suspended;
  }
  if (search_query) {
    where[Op.or as any] = [
      { name: { [Op.iLike]: `%${search_query}%` } },
      { email: { [Op.iLike]: `%${search_query}%` } },
    ];
  }

  const users = await User.findAll({ where, limit, offset });
  return users;
};

export default {
  create,
  update,
  adminUpdateUser,
  findById,
  findMe,
  findByEmail,
  getSecureUserByEmail,
  findAll,
};
