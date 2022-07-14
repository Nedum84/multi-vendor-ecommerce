import { CouponInstance } from "./model.coupon";

export enum CouponType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixedamount",
}

export type ApplyCouponResponse = {
  coupon_amount: number;
  coupon_amount_without_cap: number;
  sub_total: number;
  coupon: CouponInstance;
};
