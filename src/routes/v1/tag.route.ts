import express from "express";
import tagController from "../../controller/tag.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import tagValidation from "../../validations/tag.validation";

const router = express.Router();

router.get("/:tag_id", validateReq(tagValidation.findById), tagController.findById);
router.get("/", validateReq(tagValidation.findAll), tagController.findAll);

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(tagValidation.create), tagController.create);
router.patch("/:tag_id", validateReq(tagValidation.update), tagController.update);
export default router;
