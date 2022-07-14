import express from "express";
import topupController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import topupValidation from "./validation";

const router = express.Router();

//-->Auth routes
router.use(requireAuth);

router.post("/", validateReq(topupValidation.topUserAccount), topupController.topUserAccount);

router.get("/user", validateReq(topupValidation.findAllUser), topupController.findAllUser);
router.get("/admin", validateReq(topupValidation.findAllAdmin), topupController.findAllAdmin);

router.get("/:topup_id", validateReq(topupValidation.findById), topupController.findById);
export default router;
