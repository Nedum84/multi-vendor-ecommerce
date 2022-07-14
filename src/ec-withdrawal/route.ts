import express from "express";
import withdrawController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import withdrawalValidation from "./validation";

const router = express.Router();

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(withdrawalValidation.withdraw), withdrawController.withdraw);
router.post(
  "/:withdrawal_id/process",
  validateReq(withdrawalValidation.adminProcessWithdrawal),
  withdrawController.adminProcessWithdrawal
);
router.post(
  "/:withdrawal_id/decline",
  validateReq(withdrawalValidation.adminDeclineWithdrawal),
  withdrawController.adminDeclineWithdrawal
);
router.get(
  "/", //?=processed,offset,limit
  validateReq(withdrawalValidation.findForUser),
  withdrawController.findForUser
);
router.get(
  "/admin", //?=processed,is_declined,user_id,offset,limit
  validateReq(withdrawalValidation.adminFindAll),
  withdrawController.adminFindAll
);

export default router;
