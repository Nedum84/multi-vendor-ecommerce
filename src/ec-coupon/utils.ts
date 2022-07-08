import { FlashSalesProductsInstance } from "../ec-flash-sales/flash.sales.products.model";
import { Coupon } from "../ec-models";
import { genUniqueColId } from "../ec-models/utils";
import { ProductDiscountInstance } from "../ec-product-variation/product.discount.model";
import { CouponAttributes, CouponInstance } from "./coupon.model";

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
 * @param price Product(Variation) Price
 * @param discount Discount Price(If any)
 * @returns coupon amount
 */
export function calcCouponAmount(props: {
  coupon: CouponInstance;
  qty: number;
  price: number;
  discount?: ProductDiscountInstance;
  flash_discount?: FlashSalesProductsInstance;
}): number {
  const { qty, flash_discount, discount, price } = props;
  const { product_qty_limit, percentage_discount } = props.coupon; //{{ product_qty_limit }} == no of prod to apply coupon to
  const couponPercent = percentage_discount / 100;

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

  let actualPrice = 0;
  if (flash_discount) {
    actualPrice = flash_discount.price;
  } else if (discount) {
    actualPrice = discount.price;
  } else {
    actualPrice = price;
  }
  return couponableQty * actualPrice * couponPercent;
}

/**
 * Compares Coupon amount to max amount applicable
 * @param coupon Coupon
 * @param amount amount discount
 * @returns amount with cap applied if applicable
 */
export function applyCouponCap(coupon: CouponInstance, amount: number) {
  if (coupon.max_coupon_amount) {
    if (amount > coupon.max_coupon_amount) {
      return coupon.max_coupon_amount;
    }
  }
  return amount;
}
