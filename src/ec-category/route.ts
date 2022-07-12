import express from "express";
import categoryController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import categoryValidation from "./validation";

const router = express.Router();

router.get("/", validateReq(categoryValidation.findCategories), categoryController.findCategories);
router.get(
  "/parents", //?=category_id, direction
  validateReq(categoryValidation.findParents),
  categoryController.findParents
);
router.get(
  "/children", //?=category_id, direction
  validateReq(categoryValidation.findChildren),
  categoryController.findChildren
);
//--> At last to overcome shadowing other routes
router.get("/:category_id", validateReq(categoryValidation.findById), categoryController.findbyId);

//Auth Routes...
router.use(requireAuth);
router.post("/", validateReq(categoryValidation.create), categoryController.create);
router.patch("/:category_id", validateReq(categoryValidation.update), categoryController.update);
export default router;
