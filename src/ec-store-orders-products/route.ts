import express from "express";
import subcategoryController from "./controller";
import { validateReq } from "../ec-middlewares/validate.req";
import StoreOrdersProductValidation from "./validation";

const router = express.Router();

router.get(
  "/:store_order_id",
  validateReq(StoreOrdersProductValidation.findAllBySubOrderId),
  subcategoryController.findAllBySubOrderId
);
export default router;
