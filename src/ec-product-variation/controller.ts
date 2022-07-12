import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import { ProductDiscountAttributes } from "./discount.model";
import { ProductVariationAttributes } from "./model";
import productVariationService from "./service";

const create = async (req: Request, res: Response) => {
  const body = req.body;
  const variation: ProductVariationAttributes = body;
  const { discount }: { discount: ProductDiscountAttributes } = body;
  const { attribute_set_ids }: { attribute_set_ids: string[] } = body;

  const result = await productVariationService.create(variation, discount, attribute_set_ids);
  SuccessResponse.created(res, { variation: result });
};

const update = async (req: Request, res: Response) => {
  const result = await productVariationService.update(req);
  SuccessResponse.ok(res, { variation: result });
};

const deleteVariation = async (req: Request, res: Response) => {
  const result = await productVariationService.deleteVariation(req);
  SuccessResponse.ok(res, result);
};

const findById = async (req: Request, res: Response) => {
  const { variation_id } = req.params;
  const result = await productVariationService.findById(variation_id);
  SuccessResponse.ok(res, { variation: result });
};
const findAllByProductId = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await productVariationService.findAllByProductId(product_id);
  SuccessResponse.ok(res, { variations: result });
};

export default {
  create,
  update,
  deleteVariation,
  findById,
  findAllByProductId,
};
