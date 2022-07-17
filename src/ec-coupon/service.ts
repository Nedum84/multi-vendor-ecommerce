import { Request } from "express";
import sequelize, {
  Coupon,
  CouponCategory,
  CouponProduct,
  CouponStore,
  CouponUser,
} from "../ec-models";
import { Op } from "sequelize";
import { CouponAttributes } from "./model.coupon";
import { ApplyCouponResponse, CouponType } from "./types";
import { CouponUserAttributes } from "./model.user";
import moment from "moment";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { CouponStoreAttributes } from "./model.store";
import storeService from "../ec-store/service";
import { CouponProductAttributes } from "./model.product";
import ordersService from "../ec-orders/service";
import cartService from "../ec-cart/service";
import { isAdmin } from "../ec-apps/app-admin/roles.service";
import productService from "../ec-product/service";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { getPaginate } from "../ec-models/utils";
import { applyCouponCap, calcCouponAmount, generateNewCoupon, isRestrictedCoupon } from "./utils";
import { baseCurrencySymbol } from "../ec-utils/currency.utils";
import { WhereFilters } from "../ec-models/types";
import { categoriesChildren } from "../ec-category/utils";
import { CouponCategoryAttributes } from "./model.category";
import { couponSequelizeFindOptions } from "./utils.query";

//--> create
const create = async (req: Request) => {
  const { user_id, role, stores } = req.user!;
  const body: CouponAttributes & { products: CouponProductAttributes[] } & {
    stores: CouponStoreAttributes[];
  } & { users: CouponUserAttributes[] } & { categories: CouponCategoryAttributes[] } = req.body;
  const { coupon_code, coupon_type } = body;
  body.created_by = user_id;

  if (body.min_spend && body.max_spend) {
    if (body.max_spend < body.min_spend)
      throw new BadRequestError("{max_spend} must be greather than {min_spend}");
  }

  // if (body.vendor_bears_discount && !isAdmin(role)) {
  //   throw new BadRequestError("Only admin can change {vendor_bears_discount} field");
  // }

  if (coupon_type == CouponType.FIXED_AMOUNT) {
    if (!isAdmin(role)) {
      throw new BadRequestError("Only admin can create FIXED_AMOUNT coupon type");
    }
  }

  //--> for non-admin(only store)
  if (!isAdmin(role)) {
    body.vendor_bears_discount = true;
    if (body.stores.length) {
      //--> store should create only one STORE COUPON TYPE(One item(store) in the array)
      if (body.stores.length > 1) {
        throw new BadRequestError("You(Store) can only create one STORE COUPON TYPE");
      }
      //check to see if user has the said store and the store is active
      const { store_id } = body.stores[0];

      const store = await storeService.findById(store_id);
      if (store.user_id !== user_id) {
        //OR !stores.includes(store_id)
        throw new BadRequestError(`Not authorized to create coupon on this store(${store.name})`);
      }
    }
    if (body.products.length) {
      const products = await Promise.all(
        body.products.map(({ product_id }) => {
          return productService.findById(product_id);
        })
      );

      products.forEach((product) => {
        if (!stores.includes(product.store_id)) {
          throw new BadRequestError(
            `Not authorized to create coupon on this product(${product.name})`
          );
        }
      });
    }
    if (body.enable_free_shipping) {
      throw new BadRequestError("Store cannot enable free shipping coupon");
    }
  }

  //--> Check(validate) coupon exist
  await validateCouponExist(coupon_code);

  try {
    await sequelize.transaction(async (transaction) => {
      //--> Create coupon
      const coupon = await Coupon.create(body, { transaction });

      if (body.products?.length) {
        const payload = body.products.map(({ product_id }) => ({
          product_id,
          coupon_code,
        }));
        await CouponProduct.bulkCreate(payload, { transaction });
      }
      if (body.stores?.length) {
        const payload = body.stores.map(({ store_id }) => ({
          store_id,
          coupon_code,
        }));
        await CouponStore.bulkCreate(payload, { transaction });
      }
      if (body.users?.length) {
        const payload = body.users.map(({ user_id }) => ({
          user_id,
          coupon_code,
        }));
        await CouponUser.bulkCreate(payload, { transaction });
      }
      if (body.categories?.length) {
        const payload = body.categories.map(({ category_id }) => ({
          category_id,
          coupon_code,
        }));
        await CouponCategory.bulkCreate(payload, { transaction });
      }
    });
  } catch (error) {
    throw new BadRequestError(error);
  }

  return findByCouponCode(coupon_code);
};

/**  Generate coupon */
const generateCoupon = () => {
  return generateNewCoupon();
};

/**  Destroy coupon */
const revokeCoupon = async (req: Request) => {
  const { user_id, role } = req.user!;

  const { coupon_code } = req.body;
  const coupon = await findByCouponCode(coupon_code);

  if (coupon.created_by !== user_id && !isAdmin(role)) {
    throw new ForbiddenError("Not authorized to revoke this coupon");
  }

  coupon.revoke = true;
  await coupon.save();
  return findByCouponCode(coupon_code);
};

//-->  apply coupon
const applyCoupon = async (user_id: string, coupon_code: string): Promise<ApplyCouponResponse> => {
  const coupon = await findByCouponCode(coupon_code);
  const { carts, sub_total } = await cartService.findAllByUserId(user_id);

  if (coupon.revoke) {
    throw new ForbiddenError("This coupon is no longer available");
  }

  //Check if start date has reached
  const beforeStart = moment(coupon.start_date).isAfter();
  if (beforeStart) {
    throw new BadRequestError("Can not use this coupon yet");
  }
  //Check if date is future or past(expired)
  if (coupon.end_date) {
    const futureExpires = moment(coupon.end_date).isAfter();
    if (!futureExpires) {
      throw new BadRequestError("Coupon expired");
    }
  }

  //check if usage limit is exceeded(if usage limit is not unlimited(not null))
  if (coupon.usage_limit) {
    const codeOrders = await ordersService.findAllByCouponOrUser(coupon_code);
    if (codeOrders.length >= coupon.usage_limit) {
      throw new BadRequestError("Coupon usage limit exceeded");
    }
  }
  //check if I have used/applied this code more than each user limit
  if (coupon.usage_limit_per_user) {
    const myOrders = await ordersService.findAllByCouponOrUser(coupon_code, user_id);
    if (myOrders.length && myOrders.length >= coupon.usage_limit_per_user) {
      throw new BadRequestError("You have exceeded your limit of this coupon");
    }
  }
  // Check if cart amount is lower than the minimun amount to apply the coupon
  if (coupon.min_spend && sub_total < coupon.min_spend) {
    throw new BadRequestError(
      `The minimum spend for this coupon is ${baseCurrencySymbol}${coupon.min_spend}`
    );
  }
  // Check if cart amount is higher than the maximum amount to apply the coupon
  if (coupon.max_spend && sub_total > coupon.max_spend) {
    throw new BadRequestError(
      `The maximum spend for this coupon is ${baseCurrencySymbol}${coupon.max_spend}`
    );
  }

  // Restrict users not permitted to use coupon
  if (coupon.users?.length) {
    const couponUserIds = coupon.users.map((x) => x.user_id);
    if (!couponUserIds.includes(user_id)) {
      throw new BadRequestError("You are not eligible to use this coupon");
    }
  }

  // Amount to be discounted from the cart sub total
  let couponAmount = 0;

  if (isRestrictedCoupon(coupon)) {
    // There's restrition applied to this coupon
    const couponProductIds = coupon.products?.map((x) => x.product_id) || [];
    const couponStoreIds = coupon.stores?.map((x) => x.store_id) || [];
    const couponCategoryIds = coupon.categories?.map((x) => x.category_id) || [];

    for await (const cart of carts) {
      const { product, product_id } = cart.variation;
      const { store_id, qty } = cart;
      const { categories } = product;

      if (couponStoreIds.includes(store_id)) {
        couponAmount += calcCouponAmount(coupon, qty, cart.variation);
      } else if (couponProductIds.includes(product_id)) {
        couponAmount += calcCouponAmount(coupon, qty, cart.variation);
      } else if (couponCategoryIds.length) {
        const productCatIds = await categoriesChildren(categories.map((x) => x.category_id));
        const allCouponCatIds = await categoriesChildren(couponCategoryIds);

        // check if children category is part of the coupon restriction
        const isCatRestricted = allCouponCatIds.find((catId) => productCatIds.includes(catId));
        if (isCatRestricted) {
          couponAmount += calcCouponAmount(coupon, qty, cart.variation);
        }
      }
    }
  } else {
    // no restrictions appied
    for (const cart of carts) {
      const { qty } = cart;
      couponAmount += calcCouponAmount(coupon, qty, cart.variation);
    }
    // couponAmount += userCarts.sub_total * couponPercent;
  }

  //If {couponAmount}=0, i.e coupon was not applied & free ship isn't enabled
  if (couponAmount === 0 && !coupon.enable_free_shipping) {
    throw new BadRequestError("Sorry, this coupon is not applicable to selected products");
  }

  // For coupon with cap(max),,, Maintain the coupon amount cap
  // ie, don't allow the coupon discount to be {{ coupon_amount_without_cap }}
  return {
    coupon_amount: applyCouponCap(coupon, couponAmount),
    coupon_amount_without_cap: couponAmount,
    sub_total: sub_total,
    coupon,
  };
};

//Validate if coupon already exist
const validateCouponExist = async (coupon_code: string) => {
  //--> Check coupon exist
  const checkExist = await Coupon.findOne({ where: { coupon_code } });
  if (checkExist) {
    throw new BadRequestError(`Coupon not available`);
  }

  return "Coupon is available for use";
};

//--> find coupon by code
const findByCouponCode = async (coupon_code: string) => {
  const coupon = await Coupon.findOne({
    where: { coupon_code },
    ...couponSequelizeFindOptions(),
  });
  if (!coupon) {
    throw new NotFoundError("Coupon not found");
  }
  return coupon;
};

//--> find all by store id(or any user_id)
const findAllByStoreId = async (req: Request) => {
  const { limit, offset } = getPaginate(req.query);
  const { role, stores } = req.user!;
  const { coupon_type, store_id }: { coupon_type: CouponType; store_id: string } = req.query as any;

  if (!isAdmin(role) && !stores.includes(store_id)) {
    throw new ForbiddenError();
  }
  const where: WhereFilters<CouponAttributes> = {};
  if (coupon_type) {
    where.coupon_type = coupon_type;
  }
  if (store_id) {
    where["$stores.store_id$"] = store_id;
  }

  const coupons = await Coupon.findAll({
    where,
    ...couponSequelizeFindOptions({ limit, offset }),
  });

  return coupons;
};

//find all
const findAll = async (req: Request) => {
  const { limit, offset } = getPaginate(req.query);
  const { role } = req.user!;
  const { search_query, store_id } = req.query as any;

  if (!isAdmin(role)) {
    throw new ForbiddenError("Not authorized to access this resources");
  }
  const where: { [k: string]: any } = {};

  if (store_id) {
    where["$stores.store_id$"] = store_id;
  }
  if (search_query) {
    where[Op.or as any] = [
      { coupon_code: { [Op.iLike]: `%${search_query}%` } },
      { title: { [Op.iLike]: `%${search_query}%` } },
    ];
  }
  const coupons = await Coupon.findAll({
    where,
    ...couponSequelizeFindOptions({ limit, offset }),
  });

  return coupons;
};

export default {
  create,
  generateCoupon,
  revokeCoupon,
  applyCoupon,
  validateCouponExist,
  findByCouponCode,
  findAllByStoreId,
  findAll,
};
