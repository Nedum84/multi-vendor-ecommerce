import express from "express";
import vendorSettlementController from "../../controller/vendor.settlement.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import vendorSettlementValidation from "../../validations/vendor.settlement.validation";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/:settlement_id",
  validateReq(vendorSettlementValidation.adminProcessSettlement),
  vendorSettlementController.adminProcessSettlement
);
router.get("/:settlement_id", validateReq(vendorSettlementValidation.findById), vendorSettlementController.findById);
router.get(
  "/store/:store_id",
  validateReq(vendorSettlementValidation.findAllByStoreId),
  vendorSettlementController.findAllByStoreId
);
export default router;
