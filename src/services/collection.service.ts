import { Request } from "express";
import { NotFoundError } from "../apiresponse/not.found.error";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { CollectStatus } from "../enum/collection.enum";
import { Collection, CollectionProduct } from "../models";
import { CollectionInstance } from "../models/collection.model";
import { isAdmin } from "../utils/admin.utils";
import { asyncForEach, generateSlug, mapAsync } from "../utils/function.utils";
import { createModel, genSlugColId } from "../utils/random.string";

const create = async (req: Request) => {
  const body = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
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
    throw new UnauthorizedError();
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
