import express from "express";
import tagController from "./tag.controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import tagValidation from "./tag.validation";

const router = express.Router();

router.get("/:tag_id", validateReq(tagValidation.findById), tagController.findById);
router.get("/", validateReq(tagValidation.findAll), tagController.findAll);

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(tagValidation.create), tagController.create);
router.patch("/:tag_id", validateReq(tagValidation.update), tagController.update);
export default router;
