import { Request } from "express";
import { Op, Transaction } from "sequelize";
import { ErrorResponse } from "../apiresponse/error.response";
import sequelize, { Category, Product } from "../models";
import { ProductDiscountAttributes } from "../models/product.discount.model";
import { ProductAttributes, ProductInstance } from "../models/product.model";
import { Helpers, Paginate } from "../utils/helpers";
import ProductUtils from "../utils/product.utils";
import { createModel, genSlugColId } from "../utils/random.string";
import categoryService from "./category.service";
import { ProductVariationAttributes } from "../models/product.variation.model";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import productVariationService from "./product.variation.service";
import { NotFoundError } from "../apiresponse/not.found.error";
import { isAdmin } from "../utils/admin.utils";
import { UserRoleStatus } from "../enum/user.enum";
import collectionService from "./collection.service";
import { generateSlug, mapAsync } from "../utils/function.utils";
import { CollectStatus } from "../enum/collection.enum";
import categoryProductService from "./category.product.service";
import collectionProductService from "./collection.product.service";
import tagProductService from "./tag.product.service";

//--> Create
const create = async (req: Request) => {
  const { user_id, role } = req.user!;

  const body: ProductAttributes & {
    discount: ProductDiscountAttributes;
    variation: ProductVariationAttributes;
    collection_ids: string[];
    category_ids: string[];
    tag_ids: string[];
  } = req.body;

  body.created_by = user_id;

  if (!isAdmin(role) && role != UserRoleStatus.VENDOR) {
    throw new UnauthorizedError("Only vendore/Admin can publish a product");
  }

  //not necessary validation though🤪
  if (body.variation.with_storehouse_management) {
    if (!body.variation.stock_qty) {
      throw new ErrorResponse("Quantity is required for store house management");
    }
  } else {
    if (!body.variation.stock_status) {
      throw new ErrorResponse("Stock status is required for store house management");
    }
  }

  if (body.discount) {
    if (body.discount.price > body.variation.price) {
      throw new ErrorResponse("Discount cannot be less than the actual price");
    }
  }

  try {
    await sequelize.transaction(async (transaction) => {
      body.is_approved = true; //temporarily
      const slug = generateSlug(body.name);
      body.slug = await genSlugColId(Product, "slug", slug);

      const { product_id } = await createModel<ProductInstance>(Product, body, "product_id", transaction);

      //--> Variation
      body.product_id = product_id;
      body.variation.product_id = product_id; //for the variation body payload
      body.variation.is_default = true; //set variation to be default

      //const { variation_id } =
      await productVariationService.create(body.variation, body.discount, [], transaction);

      if (body.collection_ids) {
        await collectionProductService.createProduct(product_id, body.collection_ids, transaction);
      }
      if (body.category_ids) {
        await categoryProductService.createProduct(product_id, body.category_ids, transaction);
      }
      if (body.tag_ids) {
        await tagProductService.createProduct(product_id, body.tag_ids, transaction);
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
  const body: ProductAttributes & {
    discount: ProductDiscountAttributes;
    collection_ids: string[];
    category_ids: string[];
    tag_ids: string[];
  } = req.body;

  const product = await findById(product_id);

  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }
  Object.assign(product, body);
  await product.save();

  if (body.images && body.images.length) {
    //append
    // body.images = [...product.images, ...body.images];
    //Overrite
    body.images = [...product.images, ...body.images];
  }

  if (body.collection_ids) {
    await collectionProductService.createProduct(product_id, body.collection_ids);
  }
  if (body.category_ids) {
    await categoryProductService.createProduct(product_id, body.category_ids);
  }
  if (body.tag_ids) {
    await tagProductService.createProduct(product_id, body.tag_ids);
  }

  return findById(product.product_id);
};

const deleteCollection = async (req: Request) => {
  const { product_id, collection_ids } = req.body;
  const { stores, role } = req.user!;

  const product = await findById(product_id);
  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const del = await collectionProductService.deleteProduct(product_id, collection_ids);
  return !!del;
};

const deleteCategory = async (req: Request) => {
  const { product_id, category_ids } = req.body;
  const { stores, role } = req.user!;

  const product = await findById(product_id);
  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const del = await categoryProductService.deleteProduct(product_id, category_ids);
  return !!del;
};
const deleteTag = async (req: Request) => {
  const { product_id, tag_ids } = req.body;
  const { stores, role } = req.user!;

  const product = await findById(product_id);
  if (!stores.includes(product.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError();
  }

  const del = await tagProductService.deleteProduct(product_id, tag_ids);
  return !!del;
};

//--> findById
const findById = async (product_id: string, transaction?: Transaction) => {
  const product = await Product.findOne({
    where: { product_id },
    ...ProductUtils.sequelizeFindOptions(),
    transaction,
  });
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  return product;
};

//--> findAll
const findAll = async (req: Request) => {
  const { store_id, category_id, collection_id, search_query, is_approved, is_featured } = req.query as any;
  const options = Helpers.getPaginate(req.query);

  const where: { [key: string]: any } = {};
  if (store_id) {
    where.store_id = store_id;
  }
  if (category_id) {
    const catChilds = await categoryService.findChildren(category_id);
    const catIds = catChilds.map((c) => c.category_id);
    if (catIds) {
      where["$categories.category_id$"] = { [Op.in]: catIds };
    }
  }
  if (collection_id) {
    where["$collections.collection_id$"] = collection_id;
  }
  if (is_approved) {
    where.is_approved = is_approved;
  }
  if (is_featured) {
    where.is_featured = is_featured;
  }
  //--> to use OR
  if (search_query) {
    where[Op.or as any] = [
      { name: { [Op.iLike]: `%${search_query}%` } },
      { "$categories.name$": { [Op.iLike]: `%${search_query}%` } },
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
      "$collections.collection_id$": collection_id,
    } as any,
    ...ProductUtils.sequelizeFindOptions(paginate),
  });
  return productsCollections;
};

//--> find By collection Id
const findAllByCategoryId = async (category_id: string, paginate: Paginate) => {
  const productsCollections = await Product.findAll({
    where: {
      "$categories.category_id$": category_id,
    } as any,
    ...ProductUtils.sequelizeFindOptions(paginate),
  });
  return productsCollections;
};

//--> find By Latest...
const findLatestByCollection = async () => {
  const collections = await collectionService.findAll(CollectStatus.PUBLISHED);

  const productsCollections = await mapAsync(collections, async (collection) => {
    return {
      collection,
      products: await findAllByCollectionId(collection.collection_id, { limit: 10, offset: 0 }),
    };
  });

  const featuredCats = await Category.findAll({ where: { is_featured: true } });

  const productsCategories = await mapAsync(featuredCats, async (category) => {
    return {
      category,
      products: await findAllByCategoryId(category.category_id, { limit: 10, offset: 0 }),
    };
  });

  return {
    collections: productsCollections,
    categories: productsCategories,
  };
};

const findFlashProducts = async (req: Request) => {
  const options = Helpers.getPaginate({});

  const products = await Product.findAll({
    // where: { product_id: { [Op.in]: product_ids } },
    ...ProductUtils.sequelizeFindOptions(options),
  });

  return products;
};

export default {
  create,
  update,
  deleteCollection,
  deleteCategory,
  deleteTag,
  findById,
  findAll,
  findByProductIds,
  findLatestByCollection,
  findFlashProducts,
};
