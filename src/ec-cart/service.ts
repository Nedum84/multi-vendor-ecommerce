import { Request } from "express";
import { Op, Transaction } from "sequelize";
import {
  Cart,
  Category,
  Collection,
  FlashSales,
  FlashSalesProducts,
  Product,
  ProductDiscount,
  ProductVariation,
} from "../ec-models";
import { CartInstance } from "./model";
import productVariationService from "../ec-product-variation/service";
import { ProductVariationInstance } from "../ec-product-variation/model";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { StockStatus } from "../ec-product/types";
import { calcCartSubTotal } from "./utils";

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
    validateProductQty(variation, cart.qty + 1);

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
  const { product } = variation;

  if (cart) {
    if (action === "add") {
      //validate product qty
      validateProductQty(variation, cart.qty + 1);
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
  } else {
    await Cart.create({ user_id, variation_id, store_id: product.store_id, qty: 1 });
  }

  return findAllByUserId(user_id);
};

const clearCart = async (user_id: string, variation_id?: string, transaction?: Transaction) => {
  const variation = variation_id ? { variation_id } : {};
  //clear cart...
  await Cart.destroy({ where: { user_id, ...variation }, transaction });
  return findAllByUserId(user_id);
};
const validateCartProductQty = (carts: CartInstance[]) => {
  carts.forEach((cart) => {
    const { variation, qty } = cart;
    const { flash_discount } = variation;

    if (variation.with_storehouse_management) {
      if (variation.stock_qty < qty) {
        throw new BadRequestError(`Item ${variation.product.name} is currently out of stock`);
      }
    } else {
      if (variation.stock_status !== StockStatus.IN_STOCK) {
        throw new BadRequestError(`Item ${variation.product.name} is currently out of stock`);
      }
    }
    //Validate qty remaining for flash sale...
    if (flash_discount) {
      if (flash_discount.qty < flash_discount.sold + qty) {
        const qtyRem = flash_discount.qty - flash_discount.sold;
        throw new Error(
          `Product(${variation.product.name}) quantity remaining on flash sale is ${qtyRem}`
        );
      }
    }
  });
  return true;
};

const validateProductQty = (variation: ProductVariationInstance, qty: number) => {
  if (variation.with_storehouse_management) {
    if (variation.stock_qty < 1) {
      throw new Error(`Item ${variation.product.name} is currently out of stock`);
    }

    if (variation.stock_qty < qty) {
      throw new Error(`Item ${variation.product.name} is out of stock`);
    }
  } else {
    if (variation.stock_status !== StockStatus.IN_STOCK) {
      throw new Error(`Item ${variation.product.name} is currently out of stock`);
    }
  }
  /// Check Max product qty that can be bought once
  if (variation.max_purchase_qty) {
    if (variation.max_purchase_qty < qty) {
      throw new Error(
        `You can only purchase ${variation.max_purchase_qty} quantity of ${variation.product.name} at a time`
      );
    }
  }
  return true;
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
          include: [
            { model: Category, as: "categories" },
            { model: Collection, as: "collections" },
          ],
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
        {
          model: FlashSalesProducts,
          as: "flash_discount",
          required: false,
          include: [
            {
              model: FlashSales,
              as: "flash_sale",
              attributes: ["flash_sale_id"],
              where: {
                revoke: false,
                start_date: { [Op.lt]: new Date() },
                end_date: { [Op.or]: [{ [Op.gt]: new Date() }, null] },
              },
            },
          ],
        },
      ],
    },
  });

  return {
    sub_total: calcCartSubTotal(carts),
    carts,
  };
};

const findOneByUserAndProduct = async (user_id: string, variation_id: string) => {
  const cart = await Cart.findOne({ where: { user_id, variation_id } });
  return cart;
};

export default {
  create,
  update,
  clearCart,
  validateCartProductQty,
  findAllByUserId,
};
