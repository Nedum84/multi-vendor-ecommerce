import express from "express";
import cartController from "../../controller/cart.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import cartValidation from "../../validations/cart.validation";

const router = express.Router();

//--> Auth route
router.use(requireAuth);

router.post("/", validateReq(cartValidation.create), cartController.create);
router.patch("/", validateReq(cartValidation.update), cartController.update);
router.post("/clear", validateReq(cartValidation.clearCart), cartController.clearCart);
router.get("/", validateReq(cartValidation.findAllByUserId), cartController.findAllByUserId);
export default router;
