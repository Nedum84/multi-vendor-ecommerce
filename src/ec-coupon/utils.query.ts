import { FindOptions } from "sequelize";
import { Coupon, CouponProduct, CouponStore, CouponUser } from "../ec-models";
import { CouponInstance } from "./coupon.model";
import { FlashSalesProductsInstance } from "../ec-flash-sales/flash.sales.products.model";
import { ProductDiscountInstance } from "../ec-product-variation/product.discount.model";
import { genUniqueColId } from "../ec-models/utils";

class CouponUtils {
  static sequelizeFindOptions = (paginate?: { limit: number; offset: number }) => {
    const options: FindOptions = {
      ...(paginate ?? {}),
      subQuery: false,
      include: [
        { model: CouponProduct, as: "products" },
        { model: CouponStore, as: "stores" },
        { model: CouponUser, as: "users" },
      ],
    };
    return options;
  };
}

export default CouponUtils;
