import userFake from "../ec-user/test.faker";
import faker from "faker";
import { Product } from "../ec-models";
import mediaFake from "../ec-media/test.faker";
import categoryFake from "../ec-category/test.faker";
import { ProductStatus, StockStatus } from "./types";
import { ProductAttributes } from "./model";
import collectionFake from "../ec-collection/test.faker";
import storeFake from "../ec-store/test.faker";
import collectionProductService from "../ec-collection/service.collection.product";
import categoryProductService from "../ec-category/service.category.product";
import productVariationService from "../ec-product-variation/service";
import tagFake from "../ec-tag/test.faker";
import tagProductService from "../ec-tag/service.tag.product";
import { generateChars } from "../ec-utils/random.string";
import productService from "./service";

export default {
  rawCreate: async function (props?: any) {
    const { user_id: created_by } = await userFake.rawCreate();
    const create = await this.create();
    const data = {
      ...create,
      created_by,
      product_id: generateChars(),
      slug: generateChars(20),
      ...props,
    };

    const product = await Product.create(data);
    if (data.collection_ids) {
      await collectionProductService.createProduct(product.product_id, data.collection_ids);
    }
    if (data.category_ids) {
      await categoryProductService.createProduct(product.product_id, data.category_ids);
    }
    if (data.tag_ids) {
      await tagProductService.createProduct(product.product_id, data.tag_ids);
    }
    if (data.variation) {
      data.variation.product_id = product.product_id;
      product.variations = [
        await productVariationService.create(data.variation, data.discount, []),
      ];
    }
    return productService.findById(product.product_id);
  },
  create: async () => {
    const { category_id } = await categoryFake.rawCreate();
    const { store_id } = await storeFake.rawCreate();
    const { collection_id } = await collectionFake.rawCreate();
    const { tag_id } = await tagFake.rawCreate();

    const { file_id: img1 } = await mediaFake.rawCreateFile();
    const { file_id: img2 } = await mediaFake.rawCreateFile();

    return {
      name: faker.commerce.productName(),
      desc: faker.commerce.productDescription(),
      images: [img1, img2],
      status: ProductStatus.PUBLISHED,
      is_featured: false,
      store_id,

      //Default variationsszz...
      variation: {
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
      },

      //Discountszz
      discount: {
        price: 800,
        discount_from: new Date(),
        discount_to: new Date(Date.now() + 6 * 3600), //next 6 hours
      },
      //Categoryzz
      category_ids: [category_id],
      //Collectionszz
      collection_ids: [collection_id],
      //Tagszzz
      tag_ids: [tag_id],
    };
  },
  update: {
    name: faker.random.words(3),
    desc: faker.random.words(10),
  } as ProductAttributes,
};
