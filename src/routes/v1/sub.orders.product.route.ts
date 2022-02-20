import express from "express";
import subcategoryController from "../../controller/sub.orders.product.controller";
import { validateReq } from "../../middlewares/validate.req";
import subOrdersProductValidation from "../../validations/sub.orders.product.validation";

const router = express.Router();

router.get(
  "/:sub_order_id",
  validateReq(subOrdersProductValidation.findAllBySubOrderId),
  subcategoryController.findAllBySubOrderId
);
export default router;
