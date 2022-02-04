import express from "express";
import validate from "../../middlewares/validate";
import productImageValidation from "../../validations/product.variation.validation";
import productImageController from "../../controller/product.controller";

const router = express.Router();

router.get("/all/:product_id", validate(productImageValidation.findAll), productImageController.findAll);
router.post("", validate(productImageValidation.create), productImageController.create);
router.patch("/:image_id", validate(productImageValidation.update), productImageController.update);
router.get("/:image_id", validate(productImageValidation.findOne), productImageController.findOne);
router.delete("/:image_id", validate(productImageValidation.deleteOne), productImageController.deleteOne);
export default router;
