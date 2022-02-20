import { Cart } from "../../src/models";
import { CartAttributes } from "../../src/models/cart.model";

export default {
  rawCreate: async function (data: CartAttributes) {
    return Cart.create(data);
  },
};
