import { FindOptions } from "sequelize";
import { CouponProduct, CouponStore, CouponUser } from "../ec-models";

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
