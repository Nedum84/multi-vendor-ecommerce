import { Request } from "express";
import { Op, Transaction } from "sequelize/dist";
import { ErrorResponse } from "../apiresponse/error.response";
import { Cart, Product, ProductDiscount, ProductVariation } from "../models";
import { CartInstance } from "../models/cart.model";
import productVariationService from "./product.variation.service";

const create = async (req: Request) => {
  const { user_id } = req.user!;
  const { variation_id } = req.body!;

  const variation = await productVariationService.findById(variation_id);
  const { product } = variation;

  const cart = await findOneByUserAndProduct(user_id, variation_id);
  if (!cart) {
    await Cart.create({
      user_id,
      variation_id,
      store_id: product.store_id,
      qty: 1,
    });
  } else {
    //validate product qty
    productVariationService.validateProductQty(variation, cart.qty + 1);

    cart.qty = cart.qty + 1;
    await cart.save();
  }

  return findAllByUserId(user_id);
};

const update = async (req: Request) => {
  const { variation_id, action }: { variation_id: string; action: "add" | "remove" } = req.body;
  const { user_id } = req.user!;

  const cart = await findOneByUserAndProduct(user_id, variation_id);

  const variation = await productVariationService.findById(variation_id);

  if (cart) {
    if (action === "add") {
      //validate product qty
      productVariationService.validateProductQty(variation, cart.qty + 1);
      cart.qty = cart.qty + 1;
      await cart.save();
    } else {
      if (cart.qty == 1) {
        await clearCart(user_id, variation_id);
      } else {
        cart.qty = cart.qty - 1;
        await cart.save();
      }
    }
  }

  return findAllByUserId(user_id);
};

const clearCart = async (user_id: string, variation_id?: string, transaction?: Transaction) => {
  const variation = variation_id ? { variation_id } : {};
  const clear = await Cart.destroy({ where: { user_id, ...variation }, transaction });
  return !!clear;
};

const findAllByUserId = async (user_id: string) => {
  const carts = await Cart.findAll({
    where: { user_id },
    include: {
      model: ProductVariation,
      as: "variation",
      include: [
        {
          model: Product,
          as: "product",
        },
        {
          model: ProductDiscount,
          as: "discount",
          required: false,
          where: {
            revoke: false,
            discount_from: { [Op.lt]: new Date() },
            discount_to: { [Op.or]: [{ [Op.gt]: new Date() }, null] },
          },
        },
      ],
    },
  });

  return {
    sub_total: getSubTotal(carts),
    carts,
  };
};

const findOneByUserAndProduct = async (user_id: string, variation_id: string) => {
  const cart = await Cart.findOne({ where: { user_id, variation_id } });
  return cart;
};

const getSubTotal = (carts: CartInstance[]) => {
  var sub_total = 0;
  carts.forEach((cart) => {
    const { discount, price } = cart.variation;
    const { qty } = cart;
    if (discount) {
      sub_total += qty * discount.price;
    } else {
      sub_total += qty * price;
    }
  });

  //For testing if the two would be equal
  const sub_total2 = carts.reduce((total, cart) => {
    const { discount, price } = cart.variation;
    const { qty } = cart;
    if (discount) {
      return total + qty * discount.price;
    } else {
      return total + qty * price;
    }
  }, 0);

  console.log(`CART getsubtotal: sub_total=>${sub_total}, sub_total2=>${sub_total2}`);

  return sub_total;
};

export default {
  create,
  update,
  clearCart,
  findAllByUserId,
  getSubTotal,
};
