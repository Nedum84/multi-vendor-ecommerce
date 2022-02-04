import { Request } from "express";
import { Product, Wishlist } from "../models";
import { Helpers } from "../utils/helpers";
import productService from "./product.service";

const create = async (req: Request) => {
  const { user_id } = req.user!;
  const { product_id } = req.body;

  const product = await productService.findById(product_id);

  const wishlist = await Wishlist.findOne({ where: { user_id, product_id: product.product_id } });

  if (wishlist) {
    await wishlist.destroy();
    return productService.findById(product_id);
  }

  await Wishlist.create({
    product_id: product.product_id,
    user_id,
  });
  return productService.findById(product_id);
};

const findAllForUser = async (req: Request) => {
  const { user_id } = req.user!;
  const paginateOptions = Helpers.getPaginate(req.query);

  const wishlists = await Wishlist.findAll({
    where: { user_id },
    include: { model: Product, as: "product" },
    ...paginateOptions,
  });

  //get product string arr
  // const product_ids = wishlists.map((i) => i.product_id);
  // return productService.findByProductIds(product_ids);

  return wishlists;
};
export default {
  findAllForUser,
  create,
};
