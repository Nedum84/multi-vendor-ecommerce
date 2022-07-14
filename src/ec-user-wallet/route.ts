import express from "express";
import userWalletController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import userWalletValidation from "./validation";

const router = express.Router();

//-->Auth routes
router.use(requireAuth);

router.get("/balance", validateReq(userWalletValidation.balance), userWalletController.balance);

export default router;
