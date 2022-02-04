import { Request } from "express";
import { Op, Sequelize } from "sequelize";
import { ErrorResponse } from "../apiresponse/error.response";
import sequelize, {
  Collection,
  CollectionProduct,
  Product,
  ProductDiscount,
  ProductVariationWithAttributeSet,
} from "../models";
import { ProductDiscountAttributes } from "../models/product.discount.model";
import { ProductAttributes, ProductInstance } from "../models/product.model";
import { ProductVariation } from "../models";
import { Helpers, Paginate } from "../utils/helpers";
import ProductUtils from "../utils/product.utils";
import { createModel, genSlugColId } from "../utils/random.string";
import categoryService from "./category.service";
import { ProductVariationAttributes } from "../models/product.variation.model";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import productVariationService from "./product.variation.service";
import { NotFoundError } from "../apiresponse/not.found.error";
import moment from "moment";
import { isAdmin } from "../utils/admin.utils";
import { UserRoleStatus } from "../enum/user.enum";
import collectionService from "./collection.service";
import { generateSlug, mapAsync } from "../utils/function.utils";

//--> Create
const create = async (req: Request) => {
  const { user_id, role } = req.user!;

  const body: ProductAttributes &
    ProductVariationAttributes & {
      discount: ProductDiscountAttributes;
    } & {
      collection_id: string;
    } = req.body;

  body.created_by = user_id;

  if (!isAdmin(role) && role != UserRoleStatus.VENDOR) {
    throw new UnauthorizedError("Only vendore/Admin can publish a product");
  }

  //not necessary validation though🤪
  if (body.with_storehouse_management) {
    if (!body.stock_qty) {
      throw new ErrorResponse("Quantity is required for store house management");
    }
  } else {
    if (!body.stock_status) {
      throw new ErrorResponse("Stock status is required for store house management");
    }
  }

  if (body.discount) {
    if (body.discount.price > body.price) {
      throw new ErrorResponse("Discount cannot be less than the actual price");
    }
  }

  try {
    sequelize.transaction(async (transaction) => {
      body.is_approved = true; //temporarily
      const slug = generateSlug(body.name);
      body.slug = await genSlugColId(Product, "slug", slug);
      const { product_id } = await createModel<ProductInstance>(Product, body, "product_id", transaction);
      //--> Variation
      body.product_id = product_id;
      body.is_default = true; //set variation to be default
      const { variation_id } = await productVariationService.create(body, [], transaction);

      if (body.discount) {
        await productVariationService.createDiscount(variation_id, body.discount, req, transaction);
      }
      if (body.collection_id) {
        await collectionService.createProduct(product_id, body.collection_id, transaction);
      }
    });
  } catch (error: any) {
    throw new ErrorResponse(error);
  }

  return findById(body.product_id);
};

//--> Update
const update = async (req: Request) => {
  const { stores, role } = req.user!;
  const { product_id } = req.params;
  const body: ProductAttributes = req.body;

  const product = await findById(product_id);

  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  if (body.images && body.images.length) {
    body.images = [...product.images, ...body.images];
  }
  Object.assign(product, body);

  await product.save();
  await product.reload();

  return findById(product.product_id);
};

//--> findById
const findById = async (product_id: string) => {
  const product = await Product.findOne({
    where: { product_id },
    include: [
      {
        model: ProductVariation,
        as: "variation",
        include: [{ model: ProductVariationWithAttributeSet, as: "attribute_sets" }],
      },
      {
        model: ProductDiscount,
        as: "discount",
        limit: 1,
        where: {
          revoke: false,
          discount_to: { [Op.or]: [moment().isAfter(), null] },
          // [Op.or]: [{ discount_to: moment().isAfter() }, { discount_to: null }],
        },
      },
    ],
  });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

//--> findAll
const findAll = async (req: Request) => {
  const { store_id, category_id, search_query, is_approved } = req.query as any;
  const options = Helpers.getPaginate(req.query);

  const where: { [key: string]: any } = { is_banned: false };
  if (store_id) {
    where.store_id = store_id;
  }
  if (category_id) {
    const catChilds = await categoryService.findChildren(category_id);
    const catIds = catChilds.map((c) => c.category_id);
    if (catIds) {
      where.category_id = { [Op.in]: catIds };
    }
  }
  if (is_approved) {
    where.is_approved = is_approved;
  }
  //--> to use OR
  if (search_query) {
    where[Op.or as any] = [
      { title: { [Op.iLike]: `%${search_query}%` } },
      { "$category.name$": { [Op.iLike]: `%${search_query}%` } },
    ];
  }

  const products = await Product.findAll({
    where,
    ...ProductUtils.sequelizeFindOptions(options),
  });

  return products;
};
//--> find By product ids
const findByProductIds = async (product_ids: string[]) => {
  const options = Helpers.getPaginate({});

  const products = await Product.findAll({
    where: { product_id: { [Op.in]: product_ids } },
    ...ProductUtils.sequelizeFindOptions(options),
  });

  return products;
};

//--> find By collection Id
const findAllByCollectionId = async (collection_id: string, paginate: Paginate) => {
  const productsCollections = await Product.findAll({
    where: {
      "$collection.collection_id$": collection_id,
      // product_id:Sequelize.col("$collection.product_id$")
    } as any,
    include: [
      {
        model: CollectionProduct,
        as: "collection",
        attributes: [""],
      },
    ],
    ...ProductUtils.sequelizeFindOptions(paginate),
  });
  return productsCollections;
};

//--> find By Latest...
const findLatestByCollection = async () => {
  const collections = await collectionService.findAll();

  const productsCollections = await mapAsync(collections, async (collection) => {
    return {
      collection,
      products: await findAllByCollectionId(collection.collection_id, { limit: 10, offset: 0 }),
    };
  });
  return productsCollections;
};

export default {
  create,
  update,
  findById,
  findAll,
  findByProductIds,
  findAllByCollectionId,
  findLatestByCollection,
};
