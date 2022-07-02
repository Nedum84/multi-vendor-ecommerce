import express from "express";
import orderAddressController from "./order.address.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import orderAddressValidation from "./order.address.validation";

const router = express.Router();

router.use(requireAuth);
router.get("/", validateReq(orderAddressValidation.findAll), orderAddressController.findAll);
export default router;
