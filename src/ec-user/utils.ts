import bcrypt from "bcrypt";
import { Transaction } from "sequelize";
import { CouponAttributes } from "../ec-coupon/model.coupon";
import { CouponUserAttributes } from "../ec-coupon/model.user";
import { CouponType } from "../ec-coupon/types";
import { generateNewCoupon } from "../ec-coupon/utils";
import { Coupon, CouponUser } from "../ec-models";
import { regCouponAmountBonus } from "./constants";
import { UserAttributes } from "./model";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}
export function isPasswordMatch(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
export async function createRegCouponBonus(user: UserAttributes, transaction: Transaction) {
  const { user_id } = user;
  // Create Registration coupon bonus
  const couponCode = await generateNewCoupon();

  const body: CouponAttributes = {
    coupon_code: couponCode,
    coupon_type: CouponType.PERCENTAGE,
    title: "Welcome coupon bonus",
    start_date: new Date(),
    end_date: undefined as any, // doesn't expire,
    product_qty_limit: undefined as any,
    usage_limit: 1,
    usage_limit_per_user: 1,
    coupon_discount: 50,
    max_coupon_amount: regCouponAmountBonus,
    min_spend: 500,
    max_spend: 500,
    enable_free_shipping: undefined as any,
    vendor_bears_discount: true,
    created_by: user_id,
    revoke: false,
  };

  //--> Create coupon
  await Coupon.create(body, { transaction });
  await CouponUser.bulkCreate([{ user_id, coupon_code: couponCode }], { transaction });
}
