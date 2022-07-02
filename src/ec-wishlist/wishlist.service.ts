import { Request } from "express";
import { Product, Wishlist } from "../ec-models";
import { getPaginate } from "../ec-models/utils";

const create = async (req: Request) => {
  const { user_id } = req.user!;
  const { product_id } = req.body;

  const wishlist = await Wishlist.findOne({ where: { user_id, product_id } });

  if (wishlist) {
    await wishlist.destroy();
    return null;
  }

  const newWishlist = await Wishlist.create({
    product_id,
    user_id,
  });
  return newWishlist;
};

const findAllForUser = async (req: Request) => {
  const { user_id } = req.user!;
  const paginateOptions = getPaginate(req.query);

  const wishlists = await Product.findAll({
    where: { "$wishlists.user_id$": user_id } as any,
    subQuery: false,
    include: { model: Wishlist, as: "wishlists" },
    ...paginateOptions,
  });
  return wishlists;
};
export default {
  findAllForUser,
  create,
};
