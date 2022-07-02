import { Transaction } from "sequelize";
import { CollectionProduct } from "../ec-models";
import { distinctArray, mapAsync } from "../ec-utils/function.utils";

const createProduct = async (
  product_id: string,
  collection_ids: string[],
  transaction?: Transaction
) => {
  const colProds = await mapAsync(distinctArray(collection_ids), async (collection_id) => {
    const check = await CollectionProduct.findOne({
      where: { product_id, collection_id },
      transaction,
    });

    if (check) return check;

    const collectionProduct = await CollectionProduct.create(
      {
        product_id,
        collection_id,
      },
      { transaction }
    );
    return collectionProduct;
  });

  return colProds;
};

const deleteProduct = async (product_id: string, collection_ids: string[]) => {
  const dels = await mapAsync(collection_ids, async (collection_id) => {
    return CollectionProduct.destroy({ where: { product_id, collection_id } });
  });

  return !!dels;
};

export default {
  createProduct,
  deleteProduct,
};
