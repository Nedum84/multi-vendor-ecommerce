import { Request } from "express";
import { NotFoundError } from "../apiresponse/not.found.error";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { Tag } from "../models";
import { TagInstance } from "../models/tag.model";
import { isAdmin } from "../utils/admin.utils";
import { generateSlug } from "../utils/function.utils";
import { createModel, genSlugColId } from "../utils/random.string";

const create = async (req: Request) => {
  const body = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const slug = generateSlug(body.name);
  body.slug = await genSlugColId(Tag, "slug", slug);
  const tag = await createModel<TagInstance>(Tag, body, "tag_id");
  return tag;
};

const update = async (req: Request) => {
  const { tag_id } = req.params;
  const body = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const tag = await findById(tag_id);

  Object.assign(tag, body);
  await tag.save();
  return tag.reload();
};

const findById = async (tag_id: string) => {
  const tag = await Tag.findOne({ where: { tag_id } });

  if (!tag) {
    throw new NotFoundError("No tag found");
  }
  return tag;
};

const findAll = async (is_active?: boolean) => {
  const where = is_active ? { is_active } : {};
  const tags = await Tag.findAll({ where });
  return tags;
};

export default {
  create,
  update,
  findById,
  findAll,
};
