import express from "express";
import productRatingController from "../../controller/product.rating.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import productRatingValidation from "../../validations/product.rating.validation";

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
router.get("/check/:product_id", validateReq(productRatingValidation.checkRated), productRatingController.checkRated);
export default router;
