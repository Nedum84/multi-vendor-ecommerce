import express from "express";
import ordersController from "../../controller/orders.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import ordersValidation from "../../validations/orders.validation";

const router = express.Router();

router.use(requireAuth);

router.post("/", validateReq(ordersValidation.create), ordersController.create);
router.patch("/payment", validateReq(ordersValidation.updatePayment), ordersController.updatePayment);
router.get(
  "/unsettled/:store_id",
  validateReq(ordersValidation.storeUnsettledOrders),
  ordersController.storeUnsettledOrders
);
router.patch(
  "/user/cancel/:sub_order_id",
  validateReq(ordersValidation.userCancelOrder),
  ordersController.userCancelOrder
);
router.patch(
  "/admin/cancel/:sub_order_id",
  validateReq(ordersValidation.adminCancelOrder),
  ordersController.adminCancelOrder
);
router.patch("/refund/:sub_order_id", validateReq(ordersValidation.processRefund), ordersController.processRefund);
router.patch(
  "/update-order/:sub_order_id",
  validateReq(ordersValidation.updateOrderStatus),
  ordersController.updateOrderStatus
);
router.patch(
  "/update-delivery/:sub_order_id",
  validateReq(ordersValidation.updateDeliveryStatus),
  ordersController.updateDeliveryStatus
);
router.post("/settlestore", validateReq(ordersValidation.settleStore), ordersController.settleStore);

router.patch("/:order_id", validateReq(ordersValidation.findById), ordersController.findById);
router.patch("/", validateReq(ordersValidation.findAll), ordersController.findAll);
export default router;
