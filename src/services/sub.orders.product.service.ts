import { Transaction } from "sequelize/dist";
import { SubOrdersProduct } from "../models";
import { CartInstance } from "../models/cart.model";

const create = async (sub_order_id: string, cart: CartInstance, transaction: Transaction) => {
  const { qty, variation } = cart;
  const { discount, price } = variation;

  const variation_price = discount ? discount.price : price;

  const product = await SubOrdersProduct.create(
    {
      sub_order_id,
      variation_id: variation.variation_id,
      product_id: variation.product.product_id,
      name: variation.product.name,
      qty,
      price: variation_price,
      desc: variation.product.desc,
      weight: variation.weight,
      variation_snapshot: variation,
    },
    { transaction }
  );
  return product;
};

const findAllBySubOrderId = async (sub_order_id: string) => {
  const prods = await SubOrdersProduct.findAll({ where: { sub_order_id } });
  return prods;
};

export default {
  create,
  findAllBySubOrderId,
};
