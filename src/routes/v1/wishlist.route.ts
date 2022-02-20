import express from "express";
import wishlistController from "../../controller/wishlist.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import wishlistValidation from "../../validations/wishlist.validation";

const router = express.Router();

router.use(requireAuth);
router.post("/", validateReq(wishlistValidation.create), wishlistController.create);
router.get("/", validateReq(wishlistValidation.findAllForUser), wishlistController.findAllForUser);
export default router;
