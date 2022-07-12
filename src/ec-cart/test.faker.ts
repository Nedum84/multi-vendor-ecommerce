import { Cart } from "../ec-models";
import { CartAttributes } from "./model";
import productVariationService from "../ec-product-variation/service";

export default {
  rawCreate: async function (data: Omit<CartAttributes, "store_id">) {
    const { product } = await productVariationService.findById(data.variation_id);

    return Cart.create({ ...data, store_id: product.store_id });
  },
};
