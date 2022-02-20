import express from "express";
import userController from "../../controller/user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import userValidation from "../../validations/user.validation";

const router = express.Router();

router.use(requireAuth);

router.patch("/me", validateReq(userValidation.update), userController.update);
router.patch("/admin/:user_id", validateReq(userValidation.adminUpdateUser), userController.adminUpdateUser);
router.patch("/password", validateReq(userValidation.updatePassword), userController.updatePassword);
router.get("/me", validateReq(userValidation.findMe), userController.findMe);
router.get("/:user_id", validateReq(userValidation.findById), userController.findById);
router.get("/email/:email", validateReq(userValidation.findByEmail), userController.findByEmail);
router.get("/", validateReq(userValidation.findAll), userController.findAll);

export default router;
