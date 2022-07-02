import { Request } from "express";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { StoreOrders, StoreOrdersProduct, ProductRating, User } from "../ec-models";
import { ProductRatingAttributes } from "./product.rating.model";

const create = async (req: Request) => {
  const { user_id } = req.user!;
  const body: ProductRatingAttributes = req.body;
  const { product_id } = body;

  //check if user has purchased this product
  const checkPurchased = await StoreOrders.findOne({
    where: {
      purchased_by: user_id,
      delivered: true,
      "$products.product_id$": product_id,
    } as any,
    subQuery: false,
    include: { model: StoreOrdersProduct, as: "products" },
  });
  if (!checkPurchased) {
    throw new BadRequestError("You can't rate product you haven't purchased");
  }

  const rated = await checkRated(user_id, product_id);
  if (rated) {
    throw new BadRequestError("You have already rated this product");
  }

  body.store_id = checkPurchased.store_id;
  body.user_id = user_id;
  const rating = await ProductRating.create(body);
  return rating;
};

const update = async (req: Request) => {
  const { user_id } = req.user!;
  const body: ProductRatingAttributes = req.body;
  const { product_id } = body;

  const rated = await checkRated(user_id, product_id);
  if (!rated) {
    throw new BadRequestError("You have not rated this product");
  }

  Object.assign(rated, body);
  await rated.save();
  return rated.reload();
};

const checkRated = async (user_id: string, product_id: string) => {
  const rating = await ProductRating.findOne({ where: { user_id, product_id } });

  return rating;
};
const findByProductId = async (product_id: string) => {
  const ratings = await ProductRating.findAndCountAll({
    where: { product_id },
    attributes: ["rating"],
    include: { model: User, as: "user" },
  });

  return {
    ratings: ratings.rows,
    total: ratings.count,
  };
};

const findByStoreId = async (store_id: string) => {
  const ratings = await ProductRating.findAndCountAll({
    where: { store_id },
    attributes: ["rating"],
  });

  return {
    ratings: ratings.rows,
    total: ratings.count,
  };
};

export default {
  create,
  update,
  checkRated,
  findByProductId,
  findByStoreId,
};
