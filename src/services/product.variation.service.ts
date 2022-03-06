import { Request } from "express";
import sequelize, { ProductDiscount } from "../models";
import { ProductVariation } from "../models";
import { createModel } from "../utils/random.string";
import { ProductVariationAttributes, ProductVariationInstance } from "../models/product.variation.model";
import productService from "./product.service";
import { NotFoundError } from "../apiresponse/not.found.error";
import { ErrorResponse } from "../apiresponse/error.response";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { ProductDiscountAttributes } from "../models/product.discount.model";
import { Op, Transaction } from "sequelize/dist";
import { arraysEqual, asyncForEach } from "../utils/function.utils";
import { isAdmin } from "../utils/admin.utils";
import ProductVariationUtils from "../utils/product.variation.utils";
import variationAttributesService from "./variation.attributes.service";

//--> Create
const create = async (
  variationBody: ProductVariationAttributes,
  discount: ProductDiscountAttributes,
  attribute_set_ids: string[] = [],
  transaction?: Transaction
) => {
  //--> Get all the available product attributes
  const productAttributes = await variationAttributesService.findProductAttributes(variationBody.product_id);
  //--> Get all current variations
  const existingVariations = await findAllByProductId(variationBody.product_id, transaction);

  //--> no product attributes & variation already exist for this product
  if (productAttributes.length == 0 && existingVariations.length > 0) {
    throw new ErrorResponse("Variation already added for this product");
  }

  //validat qty.....
  if (variationBody.with_storehouse_management) {
    if (!variationBody.stock_qty) {
      throw new ErrorResponse("Quantity is required for store house management");
    }
  } else {
    if (!variationBody.stock_status) {
      throw new ErrorResponse("Stock status is required for store house management");
    }
  }

  if (productAttributes.length > 0) {
    const attributes = await variationAttributesService.findAttributeBySetIds(attribute_set_ids);

    await asyncForEach(productAttributes, async ({ attribute_id }) => {
      //--> check if all attributes are passed as create payloads
      const checkExist = attributes.find((x) => x.attribute_id == attribute_id);
      if (!checkExist) {
        const { name } = await variationAttributesService.findAttributeById(attribute_id);
        throw new ErrorResponse(`Attribute (${name}) required!`);
      }
    });

    //--> Check If Variation I want to add already Exist
    existingVariations.forEach(({ attribute_sets }) => {
      const attr_set_ids = attribute_sets?.map((v) => v.attribute_set_id);

      //--> create sets vs already existing compare
      const existsAlready = arraysEqual(attribute_set_ids, attr_set_ids);
      if (existsAlready) {
        throw new ErrorResponse("Variation already exists");
      }
    });
  }

  let variation_id: string | null;
  try {
    await sequelize.transaction(async (t) => {
      const variation = await createModel<ProductVariationInstance>(
        ProductVariation,
        variationBody,
        "variation_id",
        transaction ?? t
      );

      variation_id = variation.variation_id;
      //Create the attributes set ids
      if (productAttributes.length > 0) {
        await variationAttributesService.createVariationAttributes(attribute_set_ids, variation_id, transaction ?? t);
      }
      //Create Discount
      if (discount) {
        await createDiscount(variation_id, discount, transaction ?? t);
      }
    });
  } catch (error: any) {
    throw new ErrorResponse(error);
  }

  return findById(variation_id!, transaction);
};

//--> Update
const update = async (req: Request) => {
  const { stores, role } = req.user!;
  const { variation_id } = req.params;
  const body: ProductVariationAttributes & {
    attribute_set_ids: string[];
    discount: ProductDiscountAttributes;
  } = req.body;

  const { attribute_set_ids } = body;

  const variation = await findById(variation_id);

  const product = await productService.findById(variation.product_id);
  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  //--> Get all the available product attributes
  const productAttributes = await variationAttributesService.findProductAttributes(variation.product_id);
  //--> Get all current variations
  const existingVariations = await findAllByProductId(variation.product_id);

  if (attribute_set_ids.length) {
    if (productAttributes.length > 0) {
      const attributes = await variationAttributesService.findAttributeBySetIds(attribute_set_ids);

      await asyncForEach(productAttributes, async ({ attribute_id }) => {
        //--> check if all attributes are passed as create payloads
        const checkExist = attributes.find((x) => x.attribute_id == attribute_id);
        if (!checkExist) {
          const { name } = await variationAttributesService.findAttributeById(attribute_id);
          throw new ErrorResponse(`Attribute (${name}) required!`);
        }
      });

      //--> Check If Variation I want to add already Exist
      existingVariations.forEach(({ attribute_sets, variation_id: each_variation_id }) => {
        const attr_set_ids = attribute_sets.map((v) => v.attribute_set_id);

        //--> create sets vs already existing compare
        const existsAlready = arraysEqual(attribute_set_ids, attr_set_ids);
        //Skip if the existing one is same as the body payload variation
        if (existsAlready && variation_id !== each_variation_id) {
          throw new ErrorResponse("Variation already exists");
        }
      });
    }
  }

  try {
    await sequelize.transaction(async (transaction) => {
      //Create Discount if any
      if (body.discount) {
        const obj1 = {
          price: body.discount.price,
          discount_from: body.discount.discount_from,
          discount_to: body.discount.discount_to,
        };
        const obj2 = {
          price: variation.discount.price,
          discount_from: variation.discount.discount_from,
          discount_to: variation.discount.discount_to,
        };

        const isObjectsEqual = JSON.stringify(obj1) === JSON.stringify(obj2);
        if (!isObjectsEqual) {
          await createDiscount(variation_id, body.discount, transaction);
        }
      }

      Object.assign(variation, body);
      await variation.save({ transaction });

      //Create the attributes set ids
      if (productAttributes.length > 0) {
        const currentSetIds = variation.attribute_sets.map((a) => a.attribute_set_id);

        //--> create sets vs already existing compare
        const isEqual = arraysEqual(attribute_set_ids, currentSetIds);
        if (!isEqual) {
          //Delete already existing one for only this variation
          await variationAttributesService.deleteVariationAttributesByVariationIds([variation_id], transaction);
          //Create new ones
          await variationAttributesService.createVariationAttributes(attribute_set_ids, variation_id, transaction);
        }
      }
    });
  } catch (error: any) {
    console.log(error, "Error");

    throw new ErrorResponse(error);
  }

  return findById(variation_id);
};

//--> createDiscount
const createDiscount = async (variation_id: string, discount: ProductDiscountAttributes, t?: Transaction) => {
  //check if there's existing
  const checkExist = await ProductDiscount.findOne({
    where: {
      variation_id,
      revoke: false,
      discount_from: { [Op.lt]: new Date() },
      [Op.or]: [{ discount_to: { [Op.gt]: new Date() } }, { discount_to: null }],
    },
  });

  if (checkExist) {
    await revokeDiscount(variation_id);
  }

  await ProductDiscount.create(
    {
      variation_id,
      discount_from: discount.discount_from,
      discount_to: discount.discount_to,
      price: discount.price,
      revoke: false,
    },
    { transaction: t }
  );

  return findById(variation_id, t);
};

//--> revokeDiscount
const revokeDiscount = async (variation_id: string) => {
  const discount = await ProductDiscount.findOne({
    where: {
      variation_id,
      revoke: false,
      discount_to: { [Op.or]: [{ [Op.gt]: new Date() }, null] },
    },
  });

  if (discount) {
    discount.revoke = true;
    await discount.save();
  }

  return discount;
};

const deleteVariation = async (req: Request) => {
  const { stores, role } = req.user!;
  const { variation_id } = req.params;

  const variation = await findById(variation_id);

  const product = await productService.findById(variation.product_id);
  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const del = await sequelize.transaction(async (transaction) => {
    await variation.destroy({ transaction });
    //Delete already existing one for only this variation
    await variationAttributesService.deleteVariationAttributesByVariationIds([variation_id], transaction);
  });

  return true;
};

//--> findById
const findById = async (variation_id: string, t?: Transaction) => {
  const variation = await ProductVariation.findOne({
    where: { variation_id },
    transaction: t,
    ...ProductVariationUtils.sequelizeFindOptions(),
  });
  if (!variation) {
    throw new NotFoundError("Product not found");
  }

  return variation;
};

//--> find all variations ById
const findAllByProductId = async (product_id: string, transaction?: Transaction) => {
  const variations = await ProductVariation.findAll({
    where: { product_id },
    ...ProductVariationUtils.sequelizeFindOptions(),
    transaction,
  });
  return variations;
};

export default {
  create,
  update,
  deleteVariation,
  findById,
  findAllByProductId,
};
