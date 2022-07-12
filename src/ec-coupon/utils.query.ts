import { FindOptions } from "sequelize";
import { CouponCategory, CouponProduct, CouponStore, CouponUser } from "../ec-models";

export const couponSequelizeFindOptions = (paginate?: { limit: number; offset: number }) => {
  const options: FindOptions = {
    ...(paginate ?? {}),
    subQuery: false,
    include: [
      { model: CouponProduct, as: "products" },
      { model: CouponStore, as: "stores" },
      { model: CouponUser, as: "users" },
      { model: CouponCategory, as: "categories" },
    ],
  };
  return options;
};
