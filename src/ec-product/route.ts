import express from "express";
import productValidation from "./validation";
import productController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";

const router = express.Router();

router.get("/", validateReq(productValidation.findAll), productController.findAll);

router.get(
  "/latest",
  validateReq(productValidation.findLatestByCollection),
  productController.findLatestByCollection
);
router.get(
  "/flashlash",
  validateReq(productValidation.findFlashProducts),
  productController.findFlashProducts
);
router.get("/:product_id", validateReq(productValidation.findById), productController.findById);

router.use(requireAuth);

router.post("/", validateReq(productValidation.create), productController.create);
router.patch("/:product_id", validateReq(productValidation.update), productController.update);
router.delete(
  "/collection",
  validateReq(productValidation.deleteCollection),
  productController.deleteCollection
);
router.delete(
  "/category",
  validateReq(productValidation.deleteCategory),
  productController.deleteCategory
);
router.delete("/tag", validateReq(productValidation.deleteTag), productController.deleteTag);

export default router;
