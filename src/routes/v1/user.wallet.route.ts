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
router.get(
  "/withdrawable",
  validateReq(userWalletValidation.withrawableBalance),
  userWalletController.withrawableBalance
);

router.post(
  "/admin-credit",
  validateReq(userWalletValidation.adminCreateCreditReward),
  userWalletController.adminCreateCreditReward
);
router.post(
  "/user-credit",
  validateReq(userWalletValidation.userCreateCreditReward),
  userWalletController.userCreateCreditReward
);
router.post(
  "/redeem-credit",
  validateReq(userWalletValidation.userRedeemCreditReward),
  userWalletController.userRedeemCreditReward
);
export default router;
