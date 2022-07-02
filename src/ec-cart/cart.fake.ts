import { Cart } from "../ec-models";
import { CartAttributes } from "../ec-cart/cart.model";

export default {
  rawCreate: async function (data: CartAttributes) {
    return Cart.create(data);
  },
};
