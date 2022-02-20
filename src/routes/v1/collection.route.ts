import express from "express";
import collectionController from "../../controller/collection.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import collectionValidation from "../../validations/collection.validation";

const router = express.Router();

router.get("/:collection_id", validateReq(collectionValidation.findById), collectionController.findById);
router.get("/", validateReq(collectionValidation.findAll), collectionController.findAll);

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(collectionValidation.create), collectionController.create);
router.patch("/:collection_id", validateReq(collectionValidation.update), collectionController.update);
export default router;
