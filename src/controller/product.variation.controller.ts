import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import { ProductDiscountAttributes } from "../models/product.discount.model";
import { ProductVariationAttributes } from "../models/product.variation.model";
import productVariationService from "../services/product.variation.service";

const create = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  const body = req.body;
  const {
    variationBody,
    attribute_set_ids,
  }: { variationBody: ProductVariationAttributes; attribute_set_ids: string[] } = body;
  variationBody.product_id = product_id;

  const result = await productVariationService.create(variationBody, attribute_set_ids);
  ApiResponse.created(res, { variation: result });
};

const update = async (req: Request, res: Response) => {
  const result = await productVariationService.update(req);
  ApiResponse.ok(res, { variation: result });
};
const createDiscount = async (req: Request, res: Response) => {
  const { variation_id } = req.params;
  const body: ProductDiscountAttributes = req.body;

  const result = await productVariationService.createDiscount(variation_id, body, req);
  ApiResponse.ok(res, { variation: result });
};

const revokeDiscount = async (req: Request, res: Response) => {
  const result = await productVariationService.revokeDiscount(req);
  ApiResponse.ok(res, { variation: result });
};
const findById = async (req: Request, res: Response) => {
  const { variation_id } = req.params;
  const result = await productVariationService.findById(variation_id);
  ApiResponse.ok(res, { variation: result });
};
const findAllByProductId = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await productVariationService.findAllByProductId(product_id);
  ApiResponse.ok(res, { variations: result });
};
const createAttribute = async (req: Request, res: Response) => {
  const result = await productVariationService.createAttribute(req);
  ApiResponse.ok(res, { attribute: result });
};
const updateAttribute = async (req: Request, res: Response) => {
  const result = await productVariationService.updateAttribute(req);
  ApiResponse.ok(res, { attribute: result });
};
const findAllAttributes = async (req: Request, res: Response) => {
  const result = await productVariationService.findAllAttributes();
  ApiResponse.ok(res, { attributes: result });
};
const createAttributeSet = async (req: Request, res: Response) => {
  const result = await productVariationService.createAttributeSet(req);
  ApiResponse.ok(res, { attribute_sets: result });
};
const updateAttributeSet = async (req: Request, res: Response) => {
  const result = await productVariationService.updateAttributeSet(req);
  ApiResponse.ok(res, { attribute_sets: result });
};
const findAttributeSetsByAttributeId = async (req: Request, res: Response) => {
  const { attribute_id } = req.params;
  const result = await productVariationService.findAttributeSetsByAttributeId(attribute_id);
  ApiResponse.ok(res, { attribute_sets: result });
};
const createProductAttributes = async (req: Request, res: Response) => {
  const result = await productVariationService.createProductAttributes(req);
  ApiResponse.ok(res, { product_attributes: result });
};
const findProductAttributes = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await productVariationService.findProductAttributes(product_id);
  ApiResponse.ok(res, { product_attributes: result });
};

export default {
  create,
  update,
  createDiscount,
  revokeDiscount,
  findById,
  findAllByProductId,
  createAttribute,
  updateAttribute,
  findAllAttributes,
  createAttributeSet,
  updateAttributeSet,
  findAttributeSetsByAttributeId,
  createProductAttributes,
  findProductAttributes,
};
