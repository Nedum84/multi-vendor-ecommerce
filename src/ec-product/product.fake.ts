import userFake from "../ec-user/user.fake";
import faker from "faker";
import { Product } from "../ec-models";
import mediaFake from "../ec-media/test.faker";
import categoryFake from "../ec-category/category.fake";
import { ProductStatus, StockStatus } from "./types";
import { ProductAttributes } from "./product.model";
import collectionFake from "../ec-collection/collection.fake";
import storeFake from "../ec-store/store.fake";
import collectionProductService from "../ec-collection/collection.product.service";
import categoryProductService from "../ec-category/category.product.service";
import productVariationService from "../ec-product-variation/product.variation.service";
import tagFake from "../ec-tag/tag.fake";
import tagProductService from "../ec-tag/tag.product.service";
import { generateChars } from "../ec-utils/random.string";

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
    return product;
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
