import faker from "faker";
import { Coupon, CouponProduct } from "../ec-models";
import productFake from "../ec-product/test.faker";
import userFake from "../ec-user/test.faker";
import storeFake from "../ec-store/test.faker";
import { generateChars } from "../ec-utils/random.string";
import categoryFake from "../ec-category/test.faker";
import { CouponType } from "./types";

export default {
  rawCreateProduct: async function (props?: any) {
    const create = await this.productRestriction();
    const { user_id: created_by } = await userFake.rawCreate();

    const data = {
      ...create,
      coupon_code: generateChars(30),
      created_by,
      ...props,
    };

    const coupon = await Coupon.create(data);

    // Create product coupons
    const payload = create.products.map(({ product_id }: { product_id: any }) => ({
      product_id,
      coupon_code: coupon.coupon_code,
    }));
    await CouponProduct.bulkCreate(payload);
    return coupon;
  },
  createDiscountType: function () {
    return {
      title: faker.random.words(4),
      start_date: new Date(),
      end_date: new Date(Date.now() + 48 * 3600), //next 2 days
      product_qty_limit: 20, //no. of product(s) in the cart to apply this coupon to
      usage_limit: 20,
      max_coupon_amount: 500,
      usage_limit_per_user: 2,
      coupon_discount: 40,
    };
  },
  createFixedAmount: function () {
    return {
      title: faker.random.words(4),
      start_date: new Date(),
      coupon_type: CouponType.FIXED_AMOUNT,
      end_date: new Date(Date.now() + 48 * 3600),
      product_qty_limit: 20,
      usage_limit: 20,
      usage_limit_per_user: 5,
      min_spend: 7500,
      coupon_discount: 1250,
    };
  },
  productRestriction: async function (props?: any) {
    const { product_id: pId1 } = await productFake.rawCreate();
    const { product_id: pId2 } = await productFake.rawCreate();

    return {
      ...this.createDiscountType(),
      products: [{ product_id: pId1 }, { product_id: pId2 }],
      ...props,
    };
  },
  storeRestriction: async function (props?: any) {
    const { store_id: store1 } = await storeFake.rawCreate();
    const { store_id: store2 } = await storeFake.rawCreate();

    return {
      ...this.createDiscountType(),
      stores: [{ store_id: store1 }, { store_id: store2 }],
      ...props,
    };
  },
  userRestriction: async function (props?: any) {
    const { user_id: u1 } = await userFake.rawCreate();
    const { user_id: u2 } = await userFake.rawCreate();

    return {
      ...this.createDiscountType(),
      users: [{ user_id: u1 }, { user_id: u2 }],
      ...props,
    };
  },
  categoryRestriction: async function (props?: any) {
    const { category_id: catId1 } = await categoryFake.rawCreate();
    const { category_id: catId2 } = await categoryFake.rawCreate();

    return {
      ...this.createDiscountType(),
      categories: [{ category_id: catId1 }, { category_id: catId2 }],
      ...props,
    };
  },
};
