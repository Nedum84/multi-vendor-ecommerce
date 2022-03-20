import express from "express";
import couponController from "../../controller/coupon.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import couponValidation from "../../validations/coupon.validation";

const router = express.Router();

//Auth Routes...
router.use(requireAuth);

router.post("/", validateReq(couponValidation.create), couponController.create);
router.post("/generate", validateReq(couponValidation.generateCoupon), couponController.generateCoupon);
router.post("/revoke", validateReq(couponValidation.revokeCoupon), couponController.revokeCoupon);
router.post("/apply", validateReq(couponValidation.applyCoupon), couponController.applyCoupon);
router.post("/check-exist", validateReq(couponValidation.validateCouponExist), couponController.validateCouponExist);
router.get(
  "/stores-coupon", //?=limit,offset,coupon_apply_for
  validateReq(couponValidation.findAllByStoreId),
  couponController.findAllByStoreId
);
router.get(
  "/", //?=limit,offset,coupon_apply_for,search_query
  validateReq(couponValidation.findAll),
  couponController.findAll
);

router.get("/:coupon_code", validateReq(couponValidation.findByCouponCode), couponController.findByCouponCode);

export default router;
