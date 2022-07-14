import { BadRequestError } from "../ec-api-response/bad.request.error";
import { computeFinalPrice } from "../ec-product-variation/utils";
import { StockStatus } from "../ec-product/types";
import { CartInstance } from "./model";

export const calcCartSubTotal = (carts: CartInstance[]): number => {
  var subTotal = 0;
  for (const cart of carts) {
    const { qty } = cart;

    subTotal += qty * computeFinalPrice(cart.variation);
  }

  // OR
  // const subTotal2 = carts.reduce((total, cart) => {
  //   const { qty } = cart;

  //   return total + qty * computeFinalPrice(cart.variation);
  // }, 0);

  return subTotal;
};

export const validateCartProductsQty = (carts: CartInstance[]) => {
  for (const cart of carts) {
    const { variation, qty } = cart;
    const { flash_discount } = variation;

    if (variation.with_storehouse_management) {
      if (variation.stock_qty < qty) {
        throw new BadRequestError(`Item ${variation.product.name} is currently out of stock`);
      }
    } else {
      if (variation.stock_status !== StockStatus.IN_STOCK) {
        throw new BadRequestError(`Item ${variation.product.name} is currently out of stock`);
      }
    }
    //Validate qty remaining for flash sale...
    if (flash_discount) {
      if (flash_discount.qty < flash_discount.sold + qty) {
        const qtyRem = flash_discount.qty - flash_discount.sold;
        throw new Error(
          `Product(${variation.product.name}) quantity remaining on flash sale is ${qtyRem}`
        );
      }
    }
  }
  return true;
};
