import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import tagService from "./service.tag";

const create = async (req: Request, res: Response) => {
  const result = await tagService.create(req);
  SuccessResponse.created(res, { tag: result });
};
const update = async (req: Request, res: Response) => {
  const result = await tagService.update(req);
  SuccessResponse.ok(res, { tag: result });
};
const findById = async (req: Request, res: Response) => {
  const { tag_id } = req.params;
  const result = await tagService.findById(tag_id);
  SuccessResponse.ok(res, { tag: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await tagService.findAll();
  SuccessResponse.ok(res, { tags: result });
};

export default {
  create,
  update,
  findById,
  findAll,
};
