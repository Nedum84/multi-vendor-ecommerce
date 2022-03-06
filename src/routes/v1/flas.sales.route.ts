import express from "express";
import flashSaleController from "../../controller/flash.sale.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateReq } from "../../middlewares/validate.req";
import flashSalesValidation from "../../validations/flash.sales.validation";

const router = express.Router();

//-->Auth routes
router.use(requireAuth);
router.get("/:flash_sale_id", validateReq(flashSalesValidation.findById), flashSaleController.findById);
router.get("/", validateReq(flashSalesValidation.findAll), flashSaleController.findAll);
router.get(
  "/product/:flash_sale_id", //
  validateReq(flashSalesValidation.findAll),
  flashSaleController.findAll
);

router.post("/", validateReq(flashSalesValidation.createFlashSale), flashSaleController.createFlashSale);
router.patch("/:flash_sale_id", validateReq(flashSalesValidation.updateFlashSale), flashSaleController.updateFlashSale);
router.delete(
  "/:flash_sale_id",
  validateReq(flashSalesValidation.revokeFlashSale),
  flashSaleController.revokeFlashSale
);
router.patch(
  "/product/:flash_sale_id",
  validateReq(flashSalesValidation.upsertFlashSaleProducts),
  flashSaleController.upsertFlashSaleProducts
);
router.delete(
  "/product/:flash_sale_id",
  validateReq(flashSalesValidation.removeFlashSaleProduct),
  flashSaleController.removeFlashSaleProduct
);
export default router;
