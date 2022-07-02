import express from "express";
import subcategoryController from "./store.orders.product.controller";
import { validateReq } from "../ec-middlewares/validate.req";
import StoreOrdersProductValidation from "./store.orders.product.validation";

const router = express.Router();

router.get(
  "/:store_order_id",
  validateReq(StoreOrdersProductValidation.findAllBySubOrderId),
  subcategoryController.findAllBySubOrderId
);
export default router;
