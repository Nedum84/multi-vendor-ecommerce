import { ProductVariationInstance } from "./model";

export function computeFinalPrice(variation: ProductVariationInstance): number {
  const { flash_discount: flashDiscount, discount, price } = variation;

  if (flashDiscount) {
    return flashDiscount.price;
  } else if (discount) {
    return discount.price;
  } else {
    return price;
  }
}
