import { Transaction } from "sequelize";
import { CategoryProduct } from "../models";
import { distinctArray, mapAsync } from "../utils/function.utils";

const createProduct = async (product_id: string, category_ids: string[], transaction?: Transaction) => {
  const colProds = await mapAsync(distinctArray(category_ids), async (category_id) => {
    const check = await CategoryProduct.findOne({ where: { product_id, category_id }, transaction });

    if (check) return check;

    const collectionProduct = await CategoryProduct.create(
      {
        product_id,
        category_id,
      },
      { transaction }
    );
    return collectionProduct;
  });

  return colProds;
};

const deleteProduct = async (product_id: string, category_ids: string[]) => {
  const dels = await mapAsync(category_ids, async (category_id) => {
    return CategoryProduct.destroy({ where: { product_id, category_id } });
  });

  return !!dels;
};

export default {
  createProduct,
  deleteProduct,
};
