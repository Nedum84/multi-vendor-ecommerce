import { Request } from "express";
import sequelize, {
  Product,
  ProductAttribute,
  ProductAttributeSets,
  ProductDiscount,
  ProductVariationWithAttributeSet,
  ProductWithAttribute,
} from "../models";
import { ProductVariation } from "../models";
import { createModel } from "../utils/random.string";
import { ProductVariationAttributes, ProductVariationInstance } from "../models/product.variation.model";
import productService from "./product.service";
import { NotFoundError } from "../apiresponse/not.found.error";
import { ErrorResponse } from "../apiresponse/error.response";
import moment from "moment";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { ProductDiscountAttributes } from "../models/product.discount.model";
import { Op, Transaction } from "sequelize/dist";
import { ProductAttributeAttributes, ProductAttributeInstance } from "../models/product.attribute.model";
import { ProductAttributeSetsAttributes, ProductAttributeSetsInstance } from "../models/product.attribute.sets.model";
import { arraysEqual, asyncForEach } from "../utils/function.utils";
import { isAdmin } from "../utils/admin.utils";
import { CartInstance } from "../models/cart.model";
import { StockStatus } from "../enum/product.enum";

//--> Create
const create = async (
  variationBody: ProductVariationAttributes,
  attribute_set_ids: string[] = [],
  transaction?: Transaction
) => {
  //--> Get all the available product attributes
  const productAttributes = await findProductAttributes(variationBody.product_id);
  //--> Get all current variations
  const existingVariations = await findAllByProductId(variationBody.product_id);

  //--> no product attributes & variation already exist for this product
  if (productAttributes.length == 0 && existingVariations.length > 0) {
    throw new ErrorResponse("Variation already added for this product");
  }

  if (productAttributes.length > 0) {
    const attributes = await findAttributeBySetIds(attribute_set_ids);

    productAttributes.forEach(async ({ attribute_id }) => {
      //--> check if all attributes are passed as create payloads
      const checkExist = attributes.find((x) => x.attribute_id == attribute_id);
      if (!checkExist) {
        const { name } = await findAttributeById(attribute_id);
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
        await createVariationAttributes(attribute_set_ids, variation_id, transaction ?? t);
      }
    });
  } catch (error: any) {
    throw new ErrorResponse(error);
  }

  return findById(variation_id!);
};

//--> Update
const update = async (req: Request) => {
  const { stores, role } = req.user!;
  const { variation_id } = req.params;
  const body: ProductVariationAttributes & {
    attribute_set_ids: string[];
  } = req.body;

  const { attribute_set_ids } = body;

  const variation = await findById(variation_id);

  const product = await productService.findById(variation.product_id);
  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  //--> Get all the available product attributes
  const productAttributes = await findProductAttributes(variation.product_id);
  //--> Get all current variations
  const existingVariations = await findAllByProductId(variation.product_id);

  if (attribute_set_ids.length) {
    if (productAttributes.length > 0) {
      const attributes = await findAttributeBySetIds(attribute_set_ids);

      productAttributes.forEach(async ({ attribute_id }) => {
        //--> check if all attributes are passed as create payloads
        const checkExist = attributes.find((x) => x.attribute_id == attribute_id);
        if (!checkExist) {
          const { name } = await findAttributeById(attribute_id);
          throw new ErrorResponse(`Attribute (${name}) required!`);
        }
      });

      //--> Check If Variation I want to add already Exist
      existingVariations.forEach(({ attribute_sets, variation_id: each_variation_id }) => {
        const attr_set_ids = attribute_sets.map((v) => v.attribute_set_id);

        //--> create sets vs already existing compare
        const existsAlready = arraysEqual(attribute_set_ids, attr_set_ids);
        if (existsAlready && variation_id !== each_variation_id) {
          throw new ErrorResponse("Variation already exists");
        }
      });
    }
  }

  Object.assign(variation, body);
  await variation.save();

  //Create the attributes set ids
  if (productAttributes.length > 0) {
    const currentSetIds = variation.attribute_sets.map((a) => a.attribute_set_id);

    //--> create sets vs already existing compare
    const isEqual = arraysEqual(attribute_set_ids, currentSetIds);
    if (!isEqual) {
      //Delete already existing one for only this variation
      await deleteVariationAttributesByVariationIds([variation_id]);
      //Create new ones
      await createVariationAttributes(attribute_set_ids, variation_id);
    }
  }

  return findById(variation_id);
};
const validateCartProductQty = (carts: CartInstance[]) => {
  carts.forEach((cart) => {
    const { variation, qty } = cart;

    if (variation.with_storehouse_management) {
      if (variation.stock_qty >= qty) {
        throw new ErrorResponse(`Item ${variation.product.name} is currently out of stock`);
      }
    } else {
      if (variation.stock_status !== StockStatus.IN_STOCK) {
        throw new ErrorResponse(`Item ${variation.product.name} is currently out of stock`);
      }
    }
  });
  return true;
};

const validateProductQty = (variation: ProductVariationInstance, limit = 1) => {
  if (variation.with_storehouse_management) {
    if (variation.stock_qty >= 1) {
      throw new ErrorResponse(`Item ${variation.product.name} is currently out of stock`);
    }
  } else {
    if (variation.stock_status !== StockStatus.IN_STOCK) {
      throw new ErrorResponse(`Item ${variation.product.name} is currently out of stock`);
    }
  }
  return true;
};

/** Updates the qty to total left after purchase*/
const updateQtyRemaining = async (carts: CartInstance[], transaction?: Transaction) => {
  await asyncForEach(carts, async (cart) => {
    const { variation, qty } = cart;

    if (variation.with_storehouse_management) {
      variation.stock_qty = variation.stock_qty - qty;
      await variation.save({ transaction });
    }
  });
  return true;
};

//--> createDiscount
const createDiscount = async (
  variation_id: string,
  discount: ProductDiscountAttributes,
  req: Request,
  t?: Transaction
) => {
  const { stores, role } = req.user!;

  const variation = await findById(variation_id);

  const product = await productService.findById(variation.product_id);

  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  //expired
  const checkExist = await ProductDiscount.findOne({
    where: {
      variation_id,
      revoke: false,
      [Op.or]: [{ discount_to: moment().isBefore() }, { discount_to: null }],
    },
  });

  if (checkExist) {
    throw new ErrorResponse("Discount already added to this product");
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

  return findById(variation_id);
};

//--> revokeDiscount
const revokeDiscount = async (req: Request) => {
  const { variation_id } = req.params;

  const { stores, role } = req.user!;

  const variation = await findById(variation_id);

  const product = await productService.findById(variation.product_id);

  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const discount = await ProductDiscount.findOne({
    where: {
      variation_id,
      revoke: false,
      discount_to: { [Op.or]: [moment().isBefore(), null] },
    },
  });

  if (!discount) {
    throw new ErrorResponse("No discount found");
  }
  discount.revoke = true;

  // OR simply .....
  // await ProductDiscount.update({ revoke: true }, { where: { variation_id } });

  return findById(variation.product_id);
};

//--> findById
const findById = async (variation_id: string) => {
  const variation = await ProductVariation.findOne({
    where: { variation_id },
    include: [
      { model: Product, as: "product" },
      {
        model: ProductVariationWithAttributeSet,
        as: "attribute_sets",
        include: [{ model: ProductAttribute, as: "attribute" }],
      },
    ],
  });
  if (!variation) {
    throw new NotFoundError("Product not found");
  }

  return variation;
};

//--> find all variations ById
const findAllByProductId = async (product_id: string) => {
  const variations = await ProductVariation.findAll({
    where: { product_id },
    include: [
      { model: Product, as: "product" },
      {
        model: ProductVariationWithAttributeSet,
        as: "attribute_sets",
        include: [{ model: ProductAttribute, as: "attribute" }],
      },
    ],
  });
  return variations;
};

///----->>> VARIATIONS
//--> Product Attributes
const createAttribute = async (req: Request) => {
  const body: ProductAttributeAttributes = req.body;

  const { attribute_id } = await createModel<ProductAttributeInstance>(ProductAttribute, body, "attribute_id");

  return findAttributeById(attribute_id);
};
const updateAttribute = async (req: Request) => {
  const body: ProductAttributeAttributes = req.body;
  const { attribute_id } = req.params;

  const attribute = await findAttributeById(attribute_id);

  Object.assign(attribute, body);

  await attribute.save();

  return findAttributeById(attribute.attribute_id);
};
const findAttributeById = async (attribute_id: string) => {
  const attribute = await ProductAttribute.findOne({ where: { attribute_id } });

  if (!attribute) {
    throw new NotFoundError("No attribute found");
  }

  return attribute;
};
const findAttributeByIds = async (attribute_ids: string[]) => {
  const attributes = await ProductAttribute.findAll({
    where: { attribute_id: { [Op.in]: attribute_ids } },
  });

  return attributes;
};
const findAllAttributes = async () => {
  const attributes = await ProductAttribute.findAll({
    include: { model: ProductAttributeSets, as: "sets" },
  });

  return attributes;
};

//--> Product Attributes Sets
const createAttributeSet = async (req: Request) => {
  const body: ProductAttributeSetsAttributes = req.body;
  const { attribute_id } = req.params;
  body.attribute_id = attribute_id;

  await createModel<ProductAttributeSetsInstance>(ProductAttributeSets, body, "attribute_set_id");

  return findAttributeSetsByAttributeId(attribute_id);
};
const updateAttributeSet = async (req: Request) => {
  const body: ProductAttributeSetsAttributes = req.body;
  const { attribute_set_id } = req.params;

  const attributeSet = await findAttributeSetById(attribute_set_id);

  Object.assign(attributeSet, body);

  await attributeSet.save();

  return findAttributeSetsByAttributeId(attributeSet.attribute_id);
};
const findAttributeSetById = async (attribute_set_id: string) => {
  const attributeSet = await ProductAttributeSets.findOne({
    where: { attribute_set_id },
  });

  if (!attributeSet) {
    throw new NotFoundError("Attribute set not found");
  }

  return attributeSet;
};
/** Find many sets with attribute ID */
const findAttributeSetsByAttributeId = async (attribute_id: string) => {
  const attributeSets = await ProductAttributeSets.findAll({
    where: { attribute_id },
  });

  return attributeSets;
};
/** Find attributes sets by attribute set IDs(IN QUERY) */
const findAttributeBySetIds = async (attribute_set_ids: string[]) => {
  const attributeSets = await ProductAttributeSets.findAll({
    where: { attribute_set_id: { [Op.in]: attribute_set_ids } },
  });

  return attributeSets;
};

//--> create product attributes
const createProductAttributes = async (req: Request) => {
  type PayloadType = { product_id: string; attribute_ids: string[] };

  const { product_id, attribute_ids }: PayloadType = req.body;

  //Validate attribute_ids
  const attrs = await findAttributeByIds(attribute_ids);
  if (attrs.length !== attribute_ids.length) {
    throw new ErrorResponse("Invalid attribute(s) detected");
  }

  //Check if the same attribute_ids is the already existing ones
  const originalProdAttrs = await findProductAttributes(product_id);
  const isEqual = arraysEqual(
    attribute_ids,
    originalProdAttrs.map((x) => x.attribute_id)
  );
  if (isEqual) {
    return originalProdAttrs;
  }

  // clear attributes if any
  await ProductWithAttribute.destroy({ where: { product_id } });

  const variations = await findAllByProductId(product_id);

  const defaultVariation = variations.find((v) => v.is_default);

  if (variations.length > 1) {
    const variation_ids = variations.map((v) => v.variation_id);

    //clear all variations except the default
    await ProductVariation.destroy({
      where: {
        variation_id: {
          [Op.in]: variation_ids.filter((id) => id != defaultVariation?.variation_id),
        },
      },
    });
    // clear variation attribute sets if any
    await deleteVariationAttributesByVariationIds(variation_ids);
  }

  //build insert  payload
  const payload = attribute_ids.map((attribute_id) => ({
    attribute_id,
    product_id,
  }));
  const productAttributes = await ProductWithAttribute.bulkCreate(payload);

  //Using default variation Create new Variation attribute sets with any random sets
  if (defaultVariation) {
    if (attribute_ids.length) {
      //Find all variation attribute sets
      const allAttributeSets = await Promise.all(attribute_ids.map((id) => findAttributeSetsByAttributeId(id)));

      //Randomly select any attribute set id for all each attribute
      const randSets: string[] = [];
      if (allAttributeSets.length) {
        allAttributeSets.forEach((attributeSets) => {
          const randSetId = attributeSets[0].attribute_set_id;
          randSets.push(randSetId);
        });
      }

      await createVariationAttributes(randSets, defaultVariation.variation_id);
    }
  }

  return productAttributes;
};

//find product attributes
const findProductAttributes = async (product_id: string) => {
  const productAttributes = await ProductWithAttribute.findAll({
    where: { product_id },
  });

  return productAttributes;
};

// #### ---->>>>>>>>> PRODUCT VARIATION ATTRIBUTE SETS...
//create product variation attribute set
const createVariationAttributes = async (
  attribute_set_ids: string[],
  variation_id: string,
  transaction?: Transaction
) => {
  const body = attribute_set_ids.map((attribute_set_id) => {
    return { attribute_set_id, variation_id };
  });

  // clear attributes if any
  await ProductVariationWithAttributeSet.bulkCreate(body, { transaction });

  return findVariationAttributes(variation_id);
};
//delete variation attribute sets by many variation_ids
const deleteVariationAttributesByVariationIds = async (variation_ids: string[]) => {
  const del = await ProductVariationWithAttributeSet.destroy({
    where: { variation_id: { [Op.in]: variation_ids } },
  });

  return !!del;
};
//find variation attributes sets
const findVariationAttributes = async (variation_id: string) => {
  // const { variation_id } = req.params;

  const variationSets = await ProductVariationWithAttributeSet.findAll({
    where: { variation_id },
  });

  return variationSets;
};

export default {
  create,
  update,
  validateCartProductQty,
  validateProductQty,
  updateQtyRemaining,
  createDiscount,
  revokeDiscount,
  findById,
  findAllByProductId,

  //Attributes
  createAttribute,
  updateAttribute,
  findAllAttributes,

  //Attribute sets
  createAttributeSet,
  updateAttributeSet,
  findAttributeSetsByAttributeId,

  //product attributes
  createProductAttributes,
  findProductAttributes,
};
