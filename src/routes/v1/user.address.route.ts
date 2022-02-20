import express from "express";
import userAddressController from "../../controller/user.address.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import userAddressValidation from "../../validations/user.address.validation";

const router = express.Router();

router.use(requireAuth);
router.post("/", validateReq(userAddressValidation.create), userAddressController.create);
router.patch("/:address_id", validateReq(userAddressValidation.update), userAddressController.update);
router.get("/:address_id", validateReq(userAddressValidation.findById), userAddressController.findById);
router.get("/", validateReq(userAddressValidation.findAllByUserId), userAddressController.findAllByUserId);
export default router;
