import { Request, Response } from "express";
import productFake from "../test/factories/product.fake";
import categoryFake from "../test/factories/category.fake";
import collectionFake from "../test/factories/collection.fake";
import tagFake from "../test/factories/tag.fake";
import variationAttributesFake from "../test/factories/variation.attributes.fake";
import userAddressFake from "../test/factories/user.address.fake";
import mediaFake from "../test/factories/media.fake";
import flashSalesFake from "../test/factories/flash.sales.fake";
import storeFake from "../test/factories/store.fake";
import productVariationFake from "../test/factories/product.variation.fake";

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
