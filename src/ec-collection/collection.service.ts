import { Request } from "express";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { CollectStatus } from "./types";
import { Collection, CollectionProduct } from "../ec-models";
import { CollectionInstance } from "./collection.model";
import { isAdmin } from "../ec-admin/roles.service";
import { asyncForEach, generateSlug, mapAsync } from "../ec-utils/function.utils";
import { createModel, genSlugColId } from "../ec-models/utils";

const create = async (req: Request) => {
  const body = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const slug = generateSlug(body.name);
  body.slug = await genSlugColId(Collection, "slug", slug);
  const collection = await createModel<CollectionInstance>(Collection, body, "collection_id");
  return collection;
};

const update = async (req: Request) => {
  const { collection_id } = req.params;
  const body = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const collection = await findById(collection_id);

  Object.assign(collection, body);
  await collection.save();
  return collection.reload();
};

const findById = async (collection_id: string) => {
  const collection = await Collection.findOne({ where: { collection_id } });

  if (!collection) {
    throw new NotFoundError("No collection found");
  }
  return collection;
};

const findAll = async (status?: CollectStatus.PUBLISHED) => {
  const where = status ? { status } : {};
  const collections = await Collection.findAll({ where });
  return collections;
};

export default {
  create,
  update,
  findById,
  findAll,
};
