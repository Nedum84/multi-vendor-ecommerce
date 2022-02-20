import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import couponService from "../services/coupon.service";

const create = async (req: Request, res: Response) => {
  const result = await couponService.create(req);
  ApiResponse.created(res, { coupon: result });
};
const generateCoupon = async (req: Request, res: Response) => {
  const result = await couponService.generateCoupon();
  ApiResponse.ok(res, { coupon: result });
};
const revokeCoupon = async (req: Request, res: Response) => {
  const result = await couponService.revokeCoupon(req);
  ApiResponse.ok(res, { coupon: result });
};
const applyCoupon = async (req: Request, res: Response) => {
  const { user_id } = req.user!;
  const { coupon_code } = req.body as any;
  const result = await couponService.applyCoupon(user_id, coupon_code);
  ApiResponse.ok(res, result);
};
const validateCouponExist = async (req: Request, res: Response) => {
  const { coupon_code } = req.params;
  const result = await couponService.validateCouponExist(coupon_code);
  ApiResponse.ok(res, { coupon: result });
};
const findByCouponCode = async (req: Request, res: Response) => {
  const { coupon_code } = req.params;
  const result = await couponService.findByCouponCode(coupon_code);
  ApiResponse.ok(res, { coupon: result });
};
const findAllByStoreId = async (req: Request, res: Response) => {
  const result = await couponService.findAllByStoreId(req);
  ApiResponse.ok(res, { coupons: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await couponService.findAll(req);
  ApiResponse.ok(res, { coupons: result });
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
