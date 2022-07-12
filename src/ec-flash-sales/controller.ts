import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import flashSalesService from "./service";

const createFlashSale = async (req: Request, res: Response) => {
  const result = await flashSalesService.createFlashSale(req);
  SuccessResponse.created(res, { flash_sale: result });
};
const updateFlashSale = async (req: Request, res: Response) => {
  const result = await flashSalesService.updateFlashSale(req);
  SuccessResponse.ok(res, { flash_sale: result });
};
const revokeFlashSale = async (req: Request, res: Response) => {
  const result = await flashSalesService.revokeFlashSale(req);
  SuccessResponse.ok(res, { flash_sale: result });
};
const findById = async (req: Request, res: Response) => {
  const { flash_sale_id } = req.params;
  const result = await flashSalesService.findById(flash_sale_id);
  SuccessResponse.ok(res, { flash_sale: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await flashSalesService.findAll(req);
  SuccessResponse.ok(res, { flash_sales: result });
};

//FlashSale Products...
const upsertFlashSaleProducts = async (req: Request, res: Response) => {
  const result = await flashSalesService.upsertFlashSaleProducts(req);
  SuccessResponse.ok(res, { products: result });
};
const removeFlashSaleProduct = async (req: Request, res: Response) => {
  const result = await flashSalesService.removeFlashSaleProduct(req);
  SuccessResponse.ok(res, result);
};
const findFlashProduct = async (req: Request, res: Response) => {
  const { flash_sale_id } = req.params;
  const result = await flashSalesService.findFlashProduct(flash_sale_id);
  SuccessResponse.ok(res, { products: result });
};

export default {
  createFlashSale,
  updateFlashSale,
  revokeFlashSale,
  findById,
  findAll,
  upsertFlashSaleProducts,
  removeFlashSaleProduct,
  findFlashProduct,
};
