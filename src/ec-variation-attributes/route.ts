import express from "express";
import variationAttributesController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import variationAttributesValidation from "./validation";

const router = express.Router();

//Attributes
router.get(
  "/attributes",
  validateReq(variationAttributesValidation.findAllAttributes),
  variationAttributesController.findAllAttributes
);
//Attribute sets
router.get(
  "/attribute-set/:attribute_id",
  validateReq(variationAttributesValidation.findAttributeSetsByAttributeId),
  variationAttributesController.findAttributeSetsByAttributeId
);
//product attributes
router.get(
  "/product-attribute/:product_id",
  validateReq(variationAttributesValidation.findProductAttributes),
  variationAttributesController.findProductAttributes
);

//Auth routes.....
router.use(requireAuth);
//Attributes
router.post(
  "/attribute",
  validateReq(variationAttributesValidation.createAttribute),
  variationAttributesController.createAttribute
);
router.patch(
  "/attribute/:attribute_id",
  validateReq(variationAttributesValidation.updateAttribute),
  variationAttributesController.updateAttribute
);

//Attribute sets
router.post(
  "/attribute-set/:attribute_id",
  validateReq(variationAttributesValidation.createAttributeSet),
  variationAttributesController.createAttributeSet
);
router.patch(
  "/attribute-set/:attribute_set_id",
  validateReq(variationAttributesValidation.updateAttributeSet),
  variationAttributesController.updateAttributeSet
);
//product attributes
router.post(
  "/product-attribute",
  validateReq(variationAttributesValidation.createProductAttributes),
  variationAttributesController.createProductAttributes
);
export default router;
