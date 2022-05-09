import { Transaction } from "sequelize";
import { TagProduct } from "../models";
import { mapAsync } from "../utils/function.utils";

const createProduct = async (product_id: string, tag_ids: string[], transaction?: Transaction) => {
  const body = tag_ids.map((tag_id) => ({ tag_id, product_id }));
  const tagProds = await TagProduct.bulkCreate(body, { transaction, ignoreDuplicates: true });

  return tagProds;
};

const deleteProduct = async (product_id: string, tag_ids: string[]) => {
  const dels = await mapAsync(tag_ids, async (tag_id) => {
    return TagProduct.destroy({ where: { product_id, tag_id } });
  });

  return !!dels;
};

export default {
  createProduct,
  deleteProduct,
};
