import { Request } from "express";
import sequelize, {
  ProductAttribute,
  ProductAttributeSets,
  ProductVariationWithAttributeSet,
  ProductWithAttribute,
} from "../ec-models";
import { ProductVariation } from "../ec-models";
import { createModel } from "../ec-models/utils";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { Op, Transaction } from "sequelize";
import { ProductAttributeAttributes, ProductAttributeInstance } from "./product.attribute.model";
import {
  ProductAttributeSetsAttributes,
  ProductAttributeSetsInstance,
} from "./product.attribute.sets.model";
import { arraysEqual } from "../ec-utils/function.utils";
import productVariationService from "../ec-product-variation/service";

///----->>> VARIATIONS
//--> Product Attributes
const createAttribute = async (req: Request) => {
  const body: ProductAttributeAttributes = req.body;

  const { attribute_id } = await createModel<ProductAttributeInstance>(
    ProductAttribute,
    body,
    "attribute_id"
  );

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
    throw new BadRequestError("Invalid attribute(s) detected");
  }

  //Check if the same attribute_ids is in the already existing ones
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

  let productAttributes: any[];
  try {
    productAttributes = await sequelize.transaction(async (transaction) => {
      const variations = await productVariationService.findAllByProductId(product_id, transaction);

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
          transaction,
        });
        // clear variation attribute sets if any
        await deleteVariationAttributesByVariationIds(variation_ids, transaction);
      }

      //build insert  payload
      const payload = attribute_ids.map((attribute_id) => ({
        attribute_id,
        product_id,
      }));
      const productAttributes = await ProductWithAttribute.bulkCreate(payload, { transaction });

      //Using default variation Create new Variation attribute sets with any random sets
      if (defaultVariation) {
        if (attribute_ids.length) {
          //Find all variation attribute sets
          const allAttributeSets = await Promise.all(
            attribute_ids.map((id) => findAttributeSetsByAttributeId(id))
          );

          //Randomly select any attribute set id for all each attribute
          const randSets: string[] = [];
          if (allAttributeSets.length) {
            allAttributeSets.forEach((attributeSets) => {
              const randSetId = attributeSets[0].attribute_set_id;
              randSets.push(randSetId);
            });
          }

          await createVariationAttributes(randSets, defaultVariation.variation_id, transaction);
        }
      }

      return productAttributes;
    });
  } catch (error: any) {
    throw new BadRequestError(error);
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
const deleteVariationAttributesByVariationIds = async (
  variation_ids: string[],
  transaction?: Transaction
) => {
  const del = await ProductVariationWithAttributeSet.destroy({
    where: { variation_id: { [Op.in]: variation_ids } },
    transaction,
  });

  return !!del;
};
//find variation attributes sets
const findVariationAttributes = async (variation_id: string) => {
  const variationSets = await ProductVariationWithAttributeSet.findAll({
    where: { variation_id },
  });

  return variationSets;
};

export default {
  //Attributes
  createAttribute,
  updateAttribute,
  findAttributeById, //...
  findAllAttributes,

  //Attribute sets
  createAttributeSet,
  updateAttributeSet,
  findAttributeSetsByAttributeId,
  findAttributeBySetIds, //...

  //product attributes
  createProductAttributes,
  findProductAttributes,

  //VARIATION ATTRIBUTE SETS
  createVariationAttributes, //...
  deleteVariationAttributesByVariationIds, //...
};
