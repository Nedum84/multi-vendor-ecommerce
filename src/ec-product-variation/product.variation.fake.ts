import faker from "faker";
import { ProductDiscount, ProductVariation } from "../ec-models";
import { StockStatus } from "../ec-product/types";
import productFake from "../ec-product/product.fake";
import { generateChars } from "../ec-utils/random.string";
import productVariationService from "./product.variation.service";

export default {
  rawCreate: async function (props?: any) {
    const product = await productFake.rawCreate();
    const data = {
      ...this.create,
      variation_id: generateChars(),
      product_id: product.product_id,
      ...props,
    };

    const variation = await ProductVariation.create(data);
    variation.product = product;
    //add discount if available
    if (data.discount) {
      data.discount.variation_id = variation.variation_id;
      variation.discount = await ProductDiscount.create(data.discount);
    }
    return variation.reload();
  },
  create: {
    sku: faker.random.words(2),
    price: 1200,
    with_storehouse_management: true,
    stock_status: StockStatus.IN_STOCK,
    stock_qty: 10,
    max_purchase_qty: 10,
    weight: 12,
    length: 10,
    height: 10,
    width: 10,

    discount: {
      price: 500,
      discount_from: new Date(),
      discount_to: new Date(Date.now() + 6 * 3600), //next 6 hours
    },
  },
  update: {
    sku: faker.random.words(2),
    price: 1200,
    with_storehouse_management: true,
    stock_status: StockStatus.IN_STOCK,
    stock_qty: 10,
    max_purchase_qty: 10,
    weight: 12,
    length: 10,
    height: 10,
    width: 10,

    discount: {
      price: 600,
      discount_from: new Date(),
      discount_to: new Date(Date.now() + 8 * 3600),
    },
  },
};
