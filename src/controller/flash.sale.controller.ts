import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import flashSalesService from "../services/flash.sales.service";

const createFlashSale = async (req: Request, res: Response) => {
  const result = await flashSalesService.createFlashSale(req);
  ApiResponse.created(res, { flash_sale: result });
};
const updateFlashSale = async (req: Request, res: Response) => {
  const result = await flashSalesService.updateFlashSale(req);
  ApiResponse.ok(res, { flash_sale: result });
};
const revokeFlashSale = async (req: Request, res: Response) => {
  const result = await flashSalesService.revokeFlashSale(req);
  ApiResponse.ok(res, { flash_sale: result });
};
const findById = async (req: Request, res: Response) => {
  const { flash_sale_id } = req.params;
  const result = await flashSalesService.findById(flash_sale_id);
  ApiResponse.ok(res, { flash_sale: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await flashSalesService.findAll(req);
  ApiResponse.ok(res, { flash_sales: result });
};

//FlashSale Products...
const upsertFlashSaleProducts = async (req: Request, res: Response) => {
  const result = await flashSalesService.upsertFlashSaleProducts(req);
  ApiResponse.ok(res, { products: result });
};
const removeFlashSaleProduct = async (req: Request, res: Response) => {
  const result = await flashSalesService.removeFlashSaleProduct(req);
  ApiResponse.ok(res, result);
};
const findFlashProduct = async (req: Request, res: Response) => {
  const { flash_sale_id } = req.params;
  const result = await flashSalesService.findFlashProduct(flash_sale_id);
  ApiResponse.ok(res, { products: result });
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
