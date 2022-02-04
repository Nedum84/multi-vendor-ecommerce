import { Request } from "express";
import { Transaction } from "sequelize/dist";
import { NotFoundError } from "../apiresponse/not.found.error";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { Collection, CollectionProduct } from "../models";
import { CollectionInstance } from "../models/collection.model";
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

const findAll = async () => {
  const collections = await Collection.findAll();
  return collections;
};

const createProduct = async (product_id: string, collection_id: string, transaction?: Transaction) => {
  const check = await CollectionProduct.findOne({ where: { product_id, collection_id } });

  if (check) return check;

  const collectionProduct = await CollectionProduct.create(
    {
      product_id,
      collection_id,
    },
    { transaction }
  );

  return collectionProduct;
};

const deleteProduct = async (product_id: string, collection_id: string) => {
  const del = await CollectionProduct.destroy({
    where: { product_id, collection_id },
  });
  return !!del;
};

export default {
  create,
  update,
  findById,
  findAll,
  createProduct,
  deleteProduct,
};
