import express from "express";
import productRatingController from "./product.rating.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import productRatingValidation from "./product.rating.validation";

const router = express.Router();

router.get(
  "/product/:product_id",
  validateReq(productRatingValidation.findByProductId),
  productRatingController.findByProductId
);
router.get(
  "/store/:store_id",
  validateReq(productRatingValidation.findByStoreId),
  productRatingController.findByStoreId
);

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(productRatingValidation.create), productRatingController.create);
router.patch("/", validateReq(productRatingValidation.update), productRatingController.update);
router.get(
  "/check/:product_id",
  validateReq(productRatingValidation.checkRated),
  productRatingController.checkRated
);
export default router;
