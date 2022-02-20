import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import variationAttributesService from "../services/variation.attributes.service";

///----->>> VARIATIONS
//--> Product Attributes
const createAttribute = async (req: Request, res: Response) => {
  const result = await variationAttributesService.createAttribute(req);
  ApiResponse.created(res, { attribute: result });
};
const updateAttribute = async (req: Request, res: Response) => {
  const result = await variationAttributesService.updateAttribute(req);
  ApiResponse.ok(res, { attribute: result });
};
const findAllAttributes = async (req: Request, res: Response) => {
  const result = await variationAttributesService.findAllAttributes();
  ApiResponse.ok(res, { attributes: result });
};
const createAttributeSet = async (req: Request, res: Response) => {
  const result = await variationAttributesService.createAttributeSet(req);
  ApiResponse.created(res, { attribute_sets: result });
};
const updateAttributeSet = async (req: Request, res: Response) => {
  const result = await variationAttributesService.updateAttributeSet(req);
  ApiResponse.ok(res, { attribute_sets: result });
};
const findAttributeSetsByAttributeId = async (req: Request, res: Response) => {
  const { attribute_id } = req.params;
  const result = await variationAttributesService.findAttributeSetsByAttributeId(attribute_id);
  ApiResponse.ok(res, { attribute_sets: result });
};
const createProductAttributes = async (req: Request, res: Response) => {
  const result = await variationAttributesService.createProductAttributes(req);
  ApiResponse.ok(res, { product_attributes: result });
};
const findProductAttributes = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  const result = await variationAttributesService.findProductAttributes(product_id);
  ApiResponse.ok(res, { product_attributes: result });
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
