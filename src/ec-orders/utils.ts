import { Transaction } from "sequelize/types";
import { calcCouponAmount } from "../ec-coupon/utils";
import { computeFinalPrice } from "../ec-product-variation/utils";
import { StockStatus } from "../ec-product/types";
import { OrdersInstance } from "./model";
import productVariationService from "../ec-product-variation/service";
import couponService from "../ec-coupon/service";

export const validateOrderCreated = async (order: OrdersInstance, transaction: Transaction) => {
  let calcSubTotal = 0;
  let couponAmount = 0;

  for await (const subOrder of order.store_orders) {
    for await (const product of subOrder.products) {
      const { variation_id, qty } = product;
      const variation = await productVariationService.findById(variation_id);

      calcSubTotal += qty * computeFinalPrice(variation);

      if (order.coupon_code) {
        const coupon = await couponService.findByCouponCode(order.coupon_code);
        couponAmount += calcCouponAmount(coupon, qty, variation);
      }
    }
  }

  const amount = calcSubTotal - couponAmount;

  if (amount !== order.amount) {
    throw new Error("Order couldn't be validated");
  }

  //Update qty remaining...
  //Extra validation(s) could be removed shaaa...
  for await (const subOrder of order.store_orders) {
    for await (const product of subOrder.products) {
      const { variation_id, qty } = product;
      const variation = await productVariationService.findById(variation_id, transaction);
      const { flash_discount } = variation;

      if (variation.with_storehouse_management) {
        if (variation.stock_qty < qty) {
          throw new Error(`Item(${variation.product.name}) is currently out of stock`);
        }

        variation.stock_qty = variation.stock_qty - qty;
        await variation.save({ transaction });
      } else {
        if (variation.stock_status !== StockStatus.IN_STOCK) {
          throw new Error(`Item ${variation.product.name} is currently out of stock`);
        }
      }
      //If flashsale is included
      if (flash_discount) {
        if (flash_discount.qty < flash_discount.sold + qty) {
          const qtyRem = flash_discount.qty - flash_discount.sold;
          throw new Error(
            `Item(${variation.product.name}) quantity remaining on flash sale is ${qtyRem}`
          );
        }
        flash_discount.sold = flash_discount.sold + qty;
        await flash_discount.save({ transaction });
      }
    }
  }
  return true;
};
