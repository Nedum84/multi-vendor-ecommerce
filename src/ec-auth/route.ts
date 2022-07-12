import express from "express";
import authController from "./controller";
import { validateReq } from "../ec-middlewares/validate.req";
import authValidation from "./validation";

const router = express.Router();

router.post("/", validateReq(authValidation.register), authController.register);
router.post("/login", validateReq(authValidation.login), authController.login);
router.post(
  "/refresh-token",
  validateReq(authValidation.refreshToken),
  authController.refreshToken
);
router.post("/logout", validateReq(authValidation.logout), authController.logout);

export default router;
