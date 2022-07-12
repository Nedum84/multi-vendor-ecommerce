import { CartInstance } from "./model";

export const calcCartSubTotal = (carts: CartInstance[]): number => {
  var subTotal = 0;
  carts.forEach((cart) => {
    const { discount, flash_discount, price } = cart.variation;
    const { qty } = cart;

    if (flash_discount) {
      subTotal += qty * flash_discount.price;
    } else if (discount) {
      subTotal += qty * discount.price;
    } else {
      subTotal += qty * price;
    }
  });

  // OR
  // const sub_total2 = carts.reduce((total, cart) => {
  //   const { discount, flash_discount, price } = cart.variation;
  //   const { qty } = cart;
  //   if (flash_discount) {
  //     return total + qty * flash_discount.price;
  //   } else if (discount) {
  //     return total + qty * discount.price;
  //   } else {
  //     return total + qty * price;
  //   }
  // }, 0);

  return subTotal;
};
