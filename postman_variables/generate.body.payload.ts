import { Request, Response } from "express";
import productFake from "../src/ec-product/test.faker";
import productVariationFake from "../src/ec-product-variation/test.faker";
import storeFake from "../src/ec-store/test.faker";
import categoryFake from "../src/ec-category/test.faker";
import collectionFake from "../src/ec-collection/test.faker";
import tagFake from "../src/ec-tag/test.faker";
import variationAttributesFake from "../src/ec-variation-attributes/variation.attributes.fake";
import userAddressFake from "../src/ec-user-address/test.faker";
import mediaFake from "../src/ec-media/test.faker";
import flashSalesFake from "../src/ec-flash-sales/test.faker";

export const generateBodyPayload = async (req: Request, res: Response) => {
  const payloads = await getPayloads(req);
  res.status(200).json(payloads);
};

const getPayloads = async (req: Request) => {
  return {
    product: {
      create: await productFake.create(),
      update: productFake.update,
    },
    variation: {
      create: productVariationFake.create,
      update: productVariationFake.update,
    },
    store: {
      create: storeFake.create,
      update: storeFake.update,
    },
    category: {
      create: categoryFake.create,
      update: categoryFake.update,
    },
    collection: {
      create: collectionFake.create,
      update: collectionFake.update,
    },
    tag: {
      create: tagFake.create,
      update: tagFake.update,
    },
    variation_attributes: {
      create: variationAttributesFake.create,
      update: variationAttributesFake.update,
    },
    user_address: {
      create: userAddressFake.create,
      update: userAddressFake.update,
    },
    media: {
      create_file: mediaFake.createFile(),
      update_file: mediaFake.updateFile(),
      create_foler: mediaFake.createFolder(),
      update_foler: mediaFake.updateFolder(),
    },
    flash_sale: {
      create: flashSalesFake.create,
      update: flashSalesFake.update,
    },
  };
};
