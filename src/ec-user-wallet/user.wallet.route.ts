import express from "express";
import userWalletController from "./user.wallet.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import userWalletValidation from "./user.wallet.validation";

const router = express.Router();

//Auth Routes...
router.use(requireAuth);

router.get(
  "/",
  validateReq(userWalletValidation.getWalletBalance),
  userWalletController.getWalletBalance
);
router.get(
  "/history",
  validateReq(userWalletValidation.balanceHistory),
  userWalletController.balanceHistory
);
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
