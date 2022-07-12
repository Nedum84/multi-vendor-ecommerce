import express from "express";
import relatedProductController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import relatedProductValidation from "./validation";

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
