import express from "express";
import subcategoryController from "../../controller/store.orders.product.controller";
import { validateReq } from "../../middlewares/validate.req";
import StoreOrdersProductValidation from "../../validations/store.orders.product.validation";

const router = express.Router();

router.get(
  "/:sub_order_id",
  validateReq(StoreOrdersProductValidation.findAllBySubOrderId),
  subcategoryController.findAllBySubOrderId
);
export default router;
