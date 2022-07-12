import { CartInstance } from "../ec-cart/model";
import { categoriesChildren } from "../ec-category/utils";
import { Coupon } from "../ec-models";
import { genUniqueColId } from "../ec-models/utils";
import { ProductVariationInstance } from "../ec-product-variation/model";
import { CouponAttributes, CouponInstance } from "./model.coupon";
import { CouponType } from "./types";

/**
 * Generates Unique coupon code
 * @returns coupon code
 */
export function generateNewCoupon() {
  return genUniqueColId<CouponAttributes>(Coupon, "coupon_code", 12, "alphanumeric", "uppercase");
}

/**
 * Calculates coupon amount using coupon, product (variation) & cart xtericts/properties/values
 * @param coupon CouponInstance
 * @param qty Cart Qty
 * @param variation ProductVariationInstance
 * @returns coupon amount
 */
export function calcCouponAmount(
  coupon: CouponInstance,
  qty: number,
  variation: ProductVariationInstance
): number {
  const { flash_discount: flashDiscount, discount, price } = variation;
  const { product_qty_limit, coupon_discount: percentage_discount, coupon_type } = coupon; //{{ product_qty_limit }} == no of prod to apply coupon to
  // use percentage if {CouponType.PERCENTAGE} else use the actual price
  const couponPercent = coupon_type === CouponType.PERCENTAGE ? percentage_discount / 100 : 1;

  /*Qty to be applied on this product*/
  let couponableQty: number = 0;
  if (product_qty_limit) {
    //Check if the cart qty is gt than `product_qty_limit`
    if (qty > product_qty_limit) {
      //if gt, use `product_qty_limit`
      couponableQty = product_qty_limit;
    } else {
      //else use cart qty
      couponableQty = qty;
    }
  } else {
    // if `product_qty_limit` is not set, use cart qty
    couponableQty = qty;
  }

  let finalPrice = 0;
  if (flashDiscount) {
    finalPrice = flashDiscount.price;
  } else if (discount) {
    finalPrice = discount.price;
  } else {
    finalPrice = price;
  }
  return couponableQty * finalPrice * couponPercent;
}

/**
 * Compares Coupon amount to max amount applicable
 * @param coupon Coupon
 * @param amount amount discount
 * @returns amount with cap applied if applicable
 */
export function applyCouponCap(coupon: CouponInstance, amount: number): number {
  // FIXED AMOUNT COUPON 👇👇👇
  if (coupon.coupon_type === CouponType.FIXED_AMOUNT) {
    // `couponAmount` must be less than the `fixed price coupon amount`
    if (amount > coupon.coupon_discount) {
      return coupon.coupon_discount;
    }
  }

  // PEERCENTAGE DISCOUNT COUPON 👇👇👇
  if (coupon.max_coupon_amount) {
    if (amount > coupon.max_coupon_amount) {
      return coupon.max_coupon_amount;
    }
  }
  return amount;
}

/**
 * Checks if coupon has restriction(s) or not
 * @param coupon CouponInstance
 * @returns `true` if {restricted} otherwise `false`
 */
export function isRestrictedCoupon(coupon: CouponInstance): boolean {
  return !(
    coupon.stores.length === 0 &&
    coupon.products.length === 0 &&
    coupon.categories.length === 0
  );
}

//-->  compute Store Coupon Amount
export const calcStoreCouponAmount = async (props: {
  coupon: CouponInstance;
  couponAmount: number;
  couponAmountWithoutCap: number;
  carts: CartInstance[];
  storeId: string;
}): Promise<number> => {
  const { coupon, couponAmount, couponAmountWithoutCap, carts, storeId } = props;

  let storeCouponAmount = 0;
  if (isRestrictedCoupon(coupon)) {
    // There's restrition applied to this coupon
    const couponProductIds = coupon.products?.map((x) => x.product_id) || [];
    const couponStoreIds = coupon.stores?.map((x) => x.store_id) || [];
    const couponCategoryIds = coupon.categories?.map((x) => x.category_id) || [];

    for await (const cart of carts) {
      const { product, product_id } = cart.variation;
      const { store_id: cartStoreId, qty, variation } = cart;
      const { categories } = product;

      if (couponStoreIds.includes(storeId)) {
        //if this product belongs to this store
        if (cartStoreId === storeId) {
          storeCouponAmount += calcCouponAmount(coupon, qty, variation);
        }
      } else if (couponProductIds.includes(product_id)) {
        //if this product belongs to this store
        if (cartStoreId === storeId) {
          storeCouponAmount += calcCouponAmount(coupon, qty, variation);
        }
      } else if (couponCategoryIds.length) {
        const productCatIds = await categoriesChildren(categories.map((x) => x.category_id));
        const allCouponCatIds = await categoriesChildren(couponCategoryIds);

        // check if children category is part of the coupon restriction
        const isCatRestricted = allCouponCatIds.find((catId) => productCatIds.includes(catId));
        if (isCatRestricted) {
          if (cartStoreId === storeId) {
            storeCouponAmount += calcCouponAmount(coupon, qty, variation);
          }
        }
      }
    }
  } else {
    // no restrictions appied
    for (const cart of carts) {
      const { store_id: cartStoreId, qty, variation } = cart;

      if (cartStoreId === storeId) {
        storeCouponAmount += calcCouponAmount(coupon, qty, variation);
      }
    }
  }

  // if restriction/capping is applied & the total coupon (couponAmountWithoutCap)
  // is greather than the coupon amount(couponAmount with cap/restriction(s))
  if (couponAmount < couponAmountWithoutCap) {
    return (storeCouponAmount / couponAmountWithoutCap) * couponAmount;
  }

  return storeCouponAmount;
};
