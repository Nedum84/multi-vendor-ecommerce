import express from "express";
import collectionController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import collectionValidation from "./validation";

const router = express.Router();

router.get(
  "/:collection_id",
  validateReq(collectionValidation.findById),
  collectionController.findById
);
router.get("/", validateReq(collectionValidation.findAll), collectionController.findAll);

//-->Auth routes
router.use(requireAuth);
router.post("/", validateReq(collectionValidation.create), collectionController.create);
router.patch(
  "/:collection_id",
  validateReq(collectionValidation.update),
  collectionController.update
);
export default router;
