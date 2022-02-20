import express from "express";
import productVariationController from "../../controller/product.variation.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import productVariationValidation from "../../validations/product.variation.validation";

const router = express.Router();

router.get("/:variation_id", validateReq(productVariationValidation.findById), productVariationController.findById);
router.get(
  "/product/:product_id",
  validateReq(productVariationValidation.findAllByProductId),
  productVariationController.findAllByProductId
);

//Auth routes.....
router.use(requireAuth);
router.post("", validateReq(productVariationValidation.create), productVariationController.create);
router.patch("/:variation_id", validateReq(productVariationValidation.update), productVariationController.update);
router.delete(
  "/:variation_id",
  validateReq(productVariationValidation.deleteVariation),
  productVariationController.deleteVariation
);

export default router;
