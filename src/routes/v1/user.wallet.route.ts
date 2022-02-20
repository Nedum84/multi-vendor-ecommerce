import express from "express";
import userWalletController from "../../controller/user.wallet.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import userWalletValidation from "../../validations/user.wallet.validation";

const router = express.Router();

//Auth Routes...
router.use(requireAuth);

router.get("/", validateReq(userWalletValidation.getWalletBalance), userWalletController.getWalletBalance);
router.get("/history", validateReq(userWalletValidation.balanceHistory), userWalletController.balanceHistory);

router.post(
  "/admin-credit",
  validateReq(userWalletValidation.adminCreateCreditReward),
  userWalletController.adminCreateCreditReward
);
router.patch(
  "/user-credit",
  validateReq(userWalletValidation.userCreateCreditReward),
  userWalletController.userCreateCreditReward
);
export default router;
