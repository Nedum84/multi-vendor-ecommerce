import express from "express";
import transactionController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import transactionValidation from "./validation";

const router = express.Router();

//-->Auth routes
router.use(requireAuth);

router.get("/balance", validateReq(transactionValidation.balance), transactionController.balance);
router.get("/", validateReq(transactionValidation.findAll), transactionController.findAll);
router.get(
  "/admin",
  validateReq(transactionValidation.adminFindAll),
  transactionController.adminFindAll
);
router.get(
  "/:transaction_id",
  validateReq(transactionValidation.findById),
  transactionController.findById
);

export default router;
