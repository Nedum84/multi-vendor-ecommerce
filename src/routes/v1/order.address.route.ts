import express from "express";
import orderAddressController from "../../controller/order.address.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import orderAddressValidation from "../../validations/order.address.validation";

const router = express.Router();

router.use(requireAuth);
router.get("/", validateReq(orderAddressValidation.findAll), orderAddressController.findAll);
export default router;
