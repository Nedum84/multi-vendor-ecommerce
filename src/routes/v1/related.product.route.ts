import express from "express";
import relatedProductController from "../../controller/related.product.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import relatedProductValidation from "../../validations/related.product.validation";

const router = express.Router();

router.get(
  "/:product_id",
  validateReq(relatedProductValidation.findForProduct),
  relatedProductController.findForProduct
);

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(relatedProductValidation.create), relatedProductController.create);
router.delete("/", validateReq(relatedProductValidation.remove), relatedProductController.remove);
export default router;
