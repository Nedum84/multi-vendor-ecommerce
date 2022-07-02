import express from "express";
import storeOrdersController from "./store.orders.controller";
import { validateReq } from "../ec-middlewares/validate.req";
import storeOrdersValidation from "./store.orders.validation";

const router = express.Router();

router.get(
  "/:store_order_id",
  validateReq(storeOrdersValidation.findById),
  storeOrdersController.findById
);
router.get(
  "/order/:order_id",
  validateReq(storeOrdersValidation.findAllByOrderId),
  storeOrdersController.findAllByOrderId
);
export default router;
