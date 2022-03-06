import { FindOptions } from "sequelize";
import { Coupon, CouponProduct, CouponStore, CouponUser } from "../models";
import { CouponInstance } from "../models/coupon.model";
import { FlashSalesProductsInstance } from "../models/flash.sales.products.model";
import { ProductDiscountInstance } from "../models/product.discount.model";
import { genUniqueColId } from "./random.string";

class CouponUtils {
  /**
   * Generates Unique coupon code
   * @returns coupon code
   */
  static generateCoupon = async () => {
    return await genUniqueColId(Coupon, "coupon_code", 12, "alphanumeric", "uppercase");
  };
  /**
   * Calculates coupon amount using coupon, product (variation) & cart xtericts/properties/values
   * @param coupon CouponInstance
   * @param qty Cart Qty
   * @param price Product(Variation) Price
   * @param discount Discount Price(If any)
   * @returns coupon amount
   */
  static calcCouponAmount = (
    coupon: CouponInstance,
    qty: number,
    price: number,
    discount?: ProductDiscountInstance,
    flash_discount?: FlashSalesProductsInstance
  ): number => {
    const { product_qty_limit, percentage_discount } = coupon; //{{ product_qty_limit }} == no of prod to apply coupon to
    const couponPercent = percentage_discount / 100;

    /*Qty to be applied */
    let couponableQty: number = 0;
    if (product_qty_limit) {
      //Check if the cart qty is gt than product_qty_limit
      if (qty > product_qty_limit) {
        //if gt, use product_qty_limit
        couponableQty = product_qty_limit;
      } else {
        //else use cart qty
        couponableQty = qty;
      }
    } else {
      //check if product_qty_limit is not set, use cart qty
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

    // OR
    //if discount,
    // if (discount) {
    //   //check if product_qty_limit is set
    //   if (product_qty_limit) {
    //     //Check if the cart qty is gt than product_qty_limit
    //     if (qty > product_qty_limit) {
    //       //if gt, use product_qty_limit
    //       return product_qty_limit * discount.price * couponPercent;
    //     } else {
    //       //else use cart qty
    //       return qty * discount.price * couponPercent;
    //     }
    //   } else {
    //     //check if product_qty_limit is not set, use cart qty
    //     return qty * discount.price * couponPercent;
    //   }
    // } else {
    //   //check if product_qty_limit is set
    //   if (product_qty_limit) {
    //     //Check if the cart qty is gt than product_qty_limit
    //     if (qty > product_qty_limit) {
    //       //if gt, use product_qty_limit
    //       return product_qty_limit * price * couponPercent;
    //     } else {
    //       //else use cart qty
    //       return qty * price * couponPercent;
    //     }
    //   } else {
    //     //check if product_qty_limit is not set, use cart qty
    //     return qty * price * couponPercent;
    //   }
    // }
  };
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
