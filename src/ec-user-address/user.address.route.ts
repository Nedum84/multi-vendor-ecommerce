import express from "express";
import userAddressController from "./user.address.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import userAddressValidation from "./user.address.validation";

const router = express.Router();

router.use(requireAuth);
router.post("/", validateReq(userAddressValidation.create), userAddressController.create);
router.patch(
  "/:address_id",
  validateReq(userAddressValidation.update),
  userAddressController.update
);
router.get(
  "/:address_id",
  validateReq(userAddressValidation.findById),
  userAddressController.findById
);
router.get(
  "/",
  validateReq(userAddressValidation.findAllByUserId),
  userAddressController.findAllByUserId
);
export default router;
