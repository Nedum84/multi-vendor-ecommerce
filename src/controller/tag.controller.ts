import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import tagService from "../services/tag.service";

const create = async (req: Request, res: Response) => {
  const result = await tagService.create(req);
  ApiResponse.created(res, { tag: result });
};
const update = async (req: Request, res: Response) => {
  const result = await tagService.update(req);
  ApiResponse.ok(res, { tag: result });
};
const findById = async (req: Request, res: Response) => {
  const { tag_id } = req.params;
  const result = await tagService.findById(tag_id);
  ApiResponse.ok(res, { tag: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await tagService.findAll();
  ApiResponse.ok(res, { tags: result });
};

export default {
  create,
  update,
  findById,
  findAll,
};
