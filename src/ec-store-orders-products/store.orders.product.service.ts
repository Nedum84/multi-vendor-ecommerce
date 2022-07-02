import { Transaction } from "sequelize";
import { StoreOrdersProduct } from "../ec-models";
import { CartInstance } from "../ec-cart/cart.model";

const create = async (store_order_id: string, cart: CartInstance, transaction: Transaction) => {
  const { qty, variation } = cart;
  const { discount, price } = variation;

  const variation_price = discount ? discount.price : price;

  const product = await StoreOrdersProduct.create(
    {
      store_order_id,
      variation_id: variation.variation_id,
      product_id: variation.product.product_id,
      name: variation.product.name,
      qty,
      price: price,
      purchased_price: variation_price,
      desc: variation.product.desc,
      weight: variation.weight,
      variation_snapshot: JSON.stringify(variation.toJSON()) as any,
    },

    { transaction, hooks: true }
  );
  return product;
};

const findAllBySubOrderId = async (store_order_id: string) => {
  const prods = await StoreOrdersProduct.findAll({ where: { store_order_id } });
  return prods;
};

export default {
  create,
  findAllBySubOrderId,
};
