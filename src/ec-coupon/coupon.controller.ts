import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import couponService from "./coupon.service";

const create = async (req: Request, res: Response) => {
  const result = await couponService.create(req);
  SuccessResponse.created(res, { coupon: result });
};
const generateCoupon = async (req: Request, res: Response) => {
  const result = await couponService.generateCoupon();
  SuccessResponse.ok(res, { coupon: result });
};
const revokeCoupon = async (req: Request, res: Response) => {
  const result = await couponService.revokeCoupon(req);
  SuccessResponse.ok(res, { coupon: result });
};
const applyCoupon = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const { coupon_code } = req.body as any;
  const result = await couponService.applyCoupon(user_id, coupon_code);
  SuccessResponse.ok(res, result);
};
const validateCouponExist = async (req: Request, res: Response) => {
  const { coupon_code } = req.body;
  const result = await couponService.validateCouponExist(coupon_code);
  SuccessResponse.ok(res, result);
};
const findByCouponCode = async (req: Request, res: Response) => {
  const { coupon_code } = req.params;
  const result = await couponService.findByCouponCode(coupon_code);
  SuccessResponse.ok(res, { coupon: result });
};
const findAllByStoreId = async (req: Request, res: Response) => {
  const result = await couponService.findAllByStoreId(req);
  SuccessResponse.ok(res, { coupons: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await couponService.findAll(req);
  SuccessResponse.ok(res, { coupons: result });
};

export default {
  create,
  generateCoupon,
  revokeCoupon,
  applyCoupon,
  validateCouponExist,
  findByCouponCode,
  findAllByStoreId,
  findAll,
};
