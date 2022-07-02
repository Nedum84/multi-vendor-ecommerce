import express from "express";
import creditCodeController from "./credit.code.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import creditCodeValidation from "./credit.code.validation";

const router = express.Router();

//Auth Routes...
router.use(requireAuth);

router.post("/", validateReq(creditCodeValidation.create), creditCodeController.create);
router.post(
  "/generate",
  validateReq(creditCodeValidation.generateCreditCode),
  creditCodeController.generateCreditCode
);
router.post(
  "/revoke",
  validateReq(creditCodeValidation.revokeCreditCode),
  creditCodeController.revokeCreditCode
);
router.post(
  "/check-exist",
  validateReq(creditCodeValidation.validateCreditCodeExist),
  creditCodeController.validateCreditCodeExist
);

router.get(
  "/", //?=limit,offset,credit_type,search_query
  validateReq(creditCodeValidation.findAll),
  creditCodeController.findAll
);

router.get(
  "/:credit_code",
  validateReq(creditCodeValidation.findByCreditCodeCode),
  creditCodeController.findByCreditCodeCode
);

export default router;
