import express from "express";
import wishlistController from "./wishlist.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import wishlistValidation from "../ec-withdrawal/wishlist.validation";

const router = express.Router();

router.use(requireAuth);
router.post("/", validateReq(wishlistValidation.create), wishlistController.create);
router.get("/", validateReq(wishlistValidation.findAllForUser), wishlistController.findAllForUser);
export default router;
