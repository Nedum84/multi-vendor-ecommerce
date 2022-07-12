import express from "express";
import orderAddressController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import orderAddressValidation from "./validation";

const router = express.Router();

router.use(requireAuth);
router.get("/", validateReq(orderAddressValidation.findAll), orderAddressController.findAll);
export default router;
