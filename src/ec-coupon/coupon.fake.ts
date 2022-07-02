import faker from "faker";
import { CouponApplyFor } from "./types";
import { Coupon, CouponProduct } from "../ec-models";
import productFake from "../ec-product/product.fake";
import userFake from "../ec-user/user.fake";
import storeFake from "../ec-store/store.fake";
import { generateChars } from "../ec-utils/random.string";

export default {
  rawCreateProduct: async function (props?: any) {
    const create = await this.productCreate();
    const { user_id: created_by } = await userFake.rawCreate();

    const data = {
      ...create,
      coupon_code: generateChars(30),
      created_by,
      ...props,
    };

    const coupon = await Coupon.create(data);

    /// Create product coupons
    const payload = create.products.map(({ product_id }: { product_id: any }) => ({
      product_id,
      coupon_code: coupon.coupon_code,
    }));
    await CouponProduct.bulkCreate(payload);
    return coupon;
  },
  create: function () {
    return {
      title: faker.random.words(4),
      start_date: new Date(),
      end_date: new Date(Date.now() + 48 * 3600), //next 2 days
      product_qty_limit: 20, //no. of product(s) in the cart to apply this coupon to
      usage_limit: 20,
      max_coupon_amount: 500,
      usage_limit_per_user: 2,
      percentage_discount: 40,
    };
  },
  productCreate: async function (props?: any) {
    const { product_id: pId1 } = await productFake.rawCreate();
    const { product_id: pId2 } = await productFake.rawCreate();

    return {
      ...this.create(),
      coupon_apply_for: CouponApplyFor.PRODUCT,
      products: [{ product_id: pId1 }, { product_id: pId2 }],
      ...props,
    };
  },
  storeCreate: async function (props?: any) {
    const { store_id: store1 } = await storeFake.rawCreate();
    const { store_id: store2 } = await storeFake.rawCreate();

    return {
      ...this.create(),
      coupon_apply_for: CouponApplyFor.STORE,
      stores: [{ store_id: store1 }, { store_id: store2 }],
      ...props,
    };
  },
  userCreate: async function (props?: any) {
    const { user_id: u1 } = await userFake.rawCreate();
    const { user_id: u2 } = await userFake.rawCreate();

    return {
      ...this.create(),
      coupon_apply_for: CouponApplyFor.USER,
      users: [{ user_id: u1 }, { user_id: u2 }],
      ...props,
    };
  },
  userProductCreate: async function (props?: any) {
    const { user_id: u1 } = await userFake.rawCreate();
    const { user_id: u2 } = await userFake.rawCreate();

    const { product_id: pId1 } = await productFake.rawCreate();
    const { product_id: pId2 } = await productFake.rawCreate();

    return {
      ...this.create(),
      coupon_apply_for: CouponApplyFor.USER_AND_PRODUCT,
      users: [{ user_id: u1 }, { user_id: u2 }],
      products: [{ product_id: pId1 }, { product_id: pId2 }],
      ...props,
    };
  },
  allOrdersCreate: async function (props?: any) {
    return {
      ...this.create(),
      coupon_apply_for: CouponApplyFor.ALL_ORDERS,
      ...props,
    };
  },
};
