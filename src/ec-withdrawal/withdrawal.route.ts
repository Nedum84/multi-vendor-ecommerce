import express from "express";
import withdrawController from "./withdrawal.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import withdrawalValidation from "./withdrawal.validation";

const router = express.Router();

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(withdrawalValidation.withdraw), withdrawController.withdraw);
router.post(
  "/process/:withdrawal_id",
  validateReq(withdrawalValidation.adminProcessWithdrawal),
  withdrawController.adminProcessWithdrawal
);
router.post(
  "/decline/:withdrawal_id",
  validateReq(withdrawalValidation.adminDeclineWithdrawal),
  withdrawController.adminDeclineWithdrawal
);
router.get(
  "/", //?=processed,offset,limit
  validateReq(withdrawalValidation.findForUser),
  withdrawController.findForUser
);
router.get(
  "/all", //?=processed,is_declined,user_id,offset,limit
  validateReq(withdrawalValidation.adminFindAll),
  withdrawController.adminFindAll
);

export default router;