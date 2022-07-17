import { Request } from "express";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import sequelize, { User } from "../ec-models";
import { UserAttributes, UserInstance } from "./model";
import { createModel, getPaginate } from "../ec-models/utils";
import couponService from "../ec-coupon/service";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { isAdmin } from "../ec-apps/app-admin/roles.service";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { Op } from "sequelize";
import { createRegCouponBonus, hashPassword, isPasswordMatch } from "./utils";
import { generateNewCoupon } from "../ec-coupon/utils";
import { CouponType } from "../ec-coupon/types";
import { CouponAttributes } from "../ec-coupon/model.coupon";
import { regCouponAmountBonus } from "./constants";

const create = async (req: Request) => {
  const body: UserAttributes = req.body;
  const { email, user_id } = body;

  if (email) {
    // Check if Email is taken
    const isEmailTaken = await User.findOne({
      where: { email },
    });
    if (!!isEmailTaken) {
      throw new BadRequestError("Email already taken");
    }
  }

  try {
    await sequelize.transaction(async (t) => {
      //create user
      const user = await createModel<UserInstance>(User, body, "user_id", { transaction: t });

      await createRegCouponBonus(user, t);
    });
  } catch (error: any) {
    throw new Error(error);
  }

  return findById(body.user_id);
};
const update = async (req: Request) => {
  const { user_id } = req.user!;
  const body: UserAttributes = req.body;

  const user = await findById(user_id);

  if (user.user_id != user_id) {
    throw new ForbiddenError();
  }

  Object.assign(user, body);
  await user.save();
  return user.reload();
};

const adminUpdateUser = async (req: Request) => {
  const { role } = req.user!;
  const { user_id } = req.params!;
  const body: UserAttributes = req.body;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const user = await findById(user_id);
  Object.assign(user, body);
  await user.save();
  return user.reload();
};

const updatePassword = async (user_id: string, updateBody: any) => {
  const { new_password, old_password } = updateBody;

  const user = await getSecureUserById(user_id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (new_password === old_password) {
    throw new BadRequestError("Old password can't be same with new password");
  }

  //--> Check password match
  const match = await isPasswordMatch(old_password, user.password);

  if (!match) {
    throw new NotFoundError("Incorrect old password");
  }
  user.password = await hashPassword(new_password);
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

const findByEmail = async (email: string, withPassword = false) => {
  const include = withPassword ? ["password"] : [];
  const user = await User.findOne({
    where: { email },
    attributes: {
      include,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};

const getSecureUserById = async (user_id: string) => {
  const user = await User.scope("withSecretColumns").findOne({
    where: { user_id },
  });
  return user;
};
const getSecureUserByEmail = async (email: string) => {
  const user = await User.scope("withSecretColumns").findOne({
    where: { email },
  });
  return user;
};

const findAll = async (req: Request) => {
  const { limit, offset } = getPaginate(req.query);
  const { user_id, email, phone, suspended, search_query } = req.query as any;
  const where: { [k: string]: any } = {};

  const { role } = req.user!;
  if (!isAdmin(role)) {
    throw new ForbiddenError();
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
  updatePassword,
  adminUpdateUser,
  findById,
  findMe,
  findByEmail,
  getSecureUserByEmail,
  findAll,
};
