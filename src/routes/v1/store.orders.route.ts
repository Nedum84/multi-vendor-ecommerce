import express from "express";
import storeOrdersController from "../../controller/store.orders.controller";
import { validateReq } from "../../middlewares/validate.req";
import storeOrdersValidation from "../../validations/store.orders.validation";

const router = express.Router();

router.get("/:sub_order_id", validateReq(storeOrdersValidation.findById), storeOrdersController.findById);
router.get(
  "/order/:order_id",
  validateReq(storeOrdersValidation.findAllByOrderId),
  storeOrdersController.findAllByOrderId
);
export default router;
