import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import categoryService from "../services/category.service";
import { Helpers } from "../utils/helpers";

const create = async (req: Request, res: Response) => {
  const result = await categoryService.create(req);
  ApiResponse.created(res, { category: result });
};
const update = async (req: Request, res: Response) => {
  const result = await categoryService.update(req);
  ApiResponse.ok(res, { category: result });
};
const findbyId = async (req: Request, res: Response) => {
  const { category_id } = req.params;
  const result = await categoryService.findById(category_id);
  ApiResponse.ok(res, { category: result });
};
const findCategories = async (req: Request, res: Response) => {
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { parent_id } = req.query as any;
  const result = await categoryService.findCategories(limit, offset, parent_id);
  ApiResponse.ok(res, { categories: result });
};

const findParents = async (req: Request, res: Response) => {
  const { category_id, direction } = req.query as any;
  const result = await categoryService.findParents(category_id, direction);
  ApiResponse.ok(res, { categories: result });
};

const findChildren = async (req: Request, res: Response) => {
  const { category_id, direction } = req.query as any;
  const result = await categoryService.findChildren(category_id, direction);
  ApiResponse.ok(res, { categories: result });
};

export default {
  create,
  update,
  findbyId,
  findCategories,
  findParents,
  findChildren,
};
