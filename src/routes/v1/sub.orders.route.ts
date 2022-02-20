import express from "express";
import subOrdersController from "../../controller/sub.orders.controller";
import { validateReq } from "../../middlewares/validate.req";
import subOrdersValidation from "../../validations/sub.orders.validation";

const router = express.Router();

router.get("/:sub_order_id", validateReq(subOrdersValidation.findById), subOrdersController.findById);
router.get("/order/:order_id", validateReq(subOrdersValidation.findAllByOrderId), subOrdersController.findAllByOrderId);
export default router;
