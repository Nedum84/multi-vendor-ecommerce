import { Request } from "express";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { Tag } from "../ec-models";
import { TagInstance } from "./tag.model";
import { isAdmin } from "../ec-admin/roles.service";
import { generateSlug } from "../ec-utils/function.utils";
import { createModel, genSlugColId } from "../ec-models/utils";

const create = async (req: Request) => {
  const body = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
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
    throw new ForbiddenError();
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
