import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import variationAttributesService from "./variation.attributes.service";

///----->>> VARIATIONS
//--> Product Attributes
const createAttribute = async (req: Request, res: Response) => {
  const result = await variationAttributesService.createAttribute(req);
  SuccessResponse.created(res, { attribute: result });
};
const updateAttribute = async (req: Request, res: Response) => {
  const result = await variationAttributesService.updateAttribute(req);
  SuccessResponse.ok(res, { attribute: result });
};
const findAllAttributes = async (req: Request, res: Response) => {
  const result = await variationAttributesService.findAllAttributes();
  SuccessResponse.ok(res, { attributes: result });
};
const createAttributeSet = async (req: Request, res: Response) => {
  const result = await variationAttributesService.createAttributeSet(req);
  SuccessResponse.created(res, { attribute_sets: result });
};
const updateAttributeSet = async (req: Request, res: Response) => {
  const result = await variationAttributesService.updateAttributeSet(req);
  SuccessResponse.ok(res, { attribute_sets: result });
};
const findAttributeSetsByAttributeId = async (req: Request, res: Response) => {
  const { attribute_id } = req.params;
  const result = await variationAttributesService.findAttributeSetsByAttributeId(attribute_id);
  SuccessResponse.ok(res, { attribute_sets: result });
};
const createProductAttributes = async (req: Request, res: Response) => {
  const result = await variationAttributesService.createProductAttributes(req);
  SuccessResponse.ok(res, { product_attributes: result });
};
const findProductAttributes = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await variationAttributesService.findProductAttributes(product_id);
  SuccessResponse.ok(res, { product_attributes: result });
};

export default {
  createAttribute,
  updateAttribute,
  findAllAttributes,
  createAttributeSet,
  updateAttributeSet,
  findAttributeSetsByAttributeId,
  createProductAttributes,
  findProductAttributes,
};
