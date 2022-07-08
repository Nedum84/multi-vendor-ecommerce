import { Request } from "express";
import sequelize, { Coupon, CouponProduct, CouponStore, CouponUser } from "../ec-models";
import { Op } from "sequelize";
import { CouponAttributes, CouponInstance } from "./coupon.model";
import { CouponApplyFor, CouponType } from "./types";
import { CouponUserAttributes } from "./coupon.user.model";
import moment from "moment";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { CouponStoreAttributes } from "./coupon.store.model";
import storeService from "../ec-store/store.service";
import { CouponProductAttributes } from "./coupon.product.model";
import ordersService from "../ec-orders/orders.service";
import cartService from "../ec-cart/cart.service";
import { CartInstance } from "../ec-cart/cart.model";
import { isAdmin } from "../ec-admin/roles.service";
import productService from "../ec-product/product.service";
import { NotFoundError } from "../ec-api-response/not.found.error";
import CouponUtils from "./utils.query";
import { getPaginate } from "../ec-models/utils";
import { applyCouponCap, calcCouponAmount, generateNewCoupon } from "./utils";
import { baseCurrencySymbol } from "../ec-utils/currency.utils";

//--> create
const create = async (req: Request) => {
  const { user_id, role, stores } = req.user!;
  const body: CouponAttributes & { products: CouponProductAttributes[] } & {
    stores: CouponStoreAttributes[];
  } & { users: CouponUserAttributes[] } = req.body;
  const { coupon_apply_for, coupon_code, coupon_type } = body;
  body.created_by = user_id;

  if (coupon_apply_for == CouponApplyFor.PRODUCT && body.products.length == 0) {
    throw new BadRequestError("product(s) are required for PRODUCT COUPON TYPE");
  }

  if (coupon_apply_for == CouponApplyFor.STORE && body.stores.length == 0) {
    throw new BadRequestError("store(s) is required for STORE COUPON TYPE");
  }

  if (coupon_apply_for == CouponApplyFor.USER && body.users.length == 0) {
    throw new BadRequestError("user(s) is required for USER COUPON TYPE");
  }
  if (body.min_spend && body.max_spend) {
    if (body.max_spend < body.min_spend)
      throw new BadRequestError("{max_spend} must be greather than {min_spend}");
  }
  if (body.vendor_bears_discount && !isAdmin(role)) {
    throw new BadRequestError("Only admin can change {vendor_bears_discount} field");
  }

  if (
    coupon_apply_for == CouponApplyFor.USER_AND_PRODUCT &&
    (body.users.length == 0 || body.products.length == 0)
  ) {
    throw new BadRequestError("user(s) & product(s) are required for USER_AND_PRODUCT COUPON TYPE");
  }

  if (coupon_type == CouponType.PERCENTAGE) {
    if (!body.percentage_discount) {
      throw new BadRequestError(
        "Percentage discount required for PERCENTAGE _DISCOUNT COUPON TYPE"
      );
    }
  }

  if (coupon_type == CouponType.FIXED_AMOUNT) {
    if (!isAdmin(role)) {
      throw new BadRequestError("Only admin can create FIXED_AMOUNT coupon type");
    }
    if (!body.fixed_price_coupon_amount) {
      throw new BadRequestError("Coupon amount required for FIXED_AMOUNT COUPON TYPE");
    }
    const appliedTypes = [CouponApplyFor.USER, CouponApplyFor.ALL_ORDERS];
    if (coupon_apply_for && !appliedTypes.includes(coupon_apply_for)) {
      throw new BadRequestError("Only user(s) can be restricted for FIXED_AMOUNT COUPON TYPE");
    }
  }

  //--> only admin can create all coupons
  // But stores can only create STORE, PRODUCT & USER_AND_PRODUCT coupon
  const storeList = [CouponApplyFor.STORE, CouponApplyFor.PRODUCT, CouponApplyFor.USER_AND_PRODUCT];
  if (!storeList.includes(coupon_apply_for) && !isAdmin(role)) {
    throw new ForbiddenError(
      "Not authorized to create a coupon except STORE, PRODUCT & USER_AND_PRODUCT COUPON TYPE"
    );
  }

  //--> for non-admin(only store)
  if (storeList.includes(coupon_apply_for) && !isAdmin(role)) {
    if (coupon_apply_for === CouponApplyFor.STORE) {
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
    } else if (
      coupon_code === CouponApplyFor.PRODUCT ||
      coupon_code === CouponApplyFor.USER_AND_PRODUCT
    ) {
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
  }

  //--> Check(validate) coupon exist
  await validateCouponExist(coupon_code);

  try {
    await sequelize.transaction(async (transaction) => {
      //--> Create coupon
      const coupon = await Coupon.create(body, { transaction });

      //--> Create respective coupon types(except for general)
      if (coupon_apply_for === CouponApplyFor.PRODUCT) {
        const payload = body.products.map(({ product_id }) => ({
          product_id,
          coupon_code,
        }));
        await CouponProduct.bulkCreate(payload, { transaction });
      } else if (coupon_apply_for === CouponApplyFor.STORE) {
        const payload = body.stores.map(({ store_id }) => ({
          store_id,
          coupon_code,
        }));
        await CouponStore.bulkCreate(payload, { transaction });
      } else if (coupon_apply_for === CouponApplyFor.USER) {
        const payload = body.users.map(({ user_id }) => ({
          user_id,
          coupon_code,
        }));
        await CouponUser.bulkCreate(payload, { transaction });
      } else if (coupon_apply_for === CouponApplyFor.USER_AND_PRODUCT) {
        //--> User payload
        const userPayload = body.users.map(({ user_id }) => ({
          user_id,
          coupon_code,
        }));
        await CouponUser.bulkCreate(userPayload, { transaction });
        //--> store payload
        const productPayload = body.products.map(({ product_id }) => ({
          product_id,
          coupon_code,
        }));
        await CouponProduct.bulkCreate(productPayload, { transaction });
      }
    });
  } catch (error: any) {
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
const applyCoupon = async (user_id: string, coupon_code: string) => {
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
      `The minimum spend for this coupon is ${baseCurrencySymbol}${sub_total}`
    );
  }
  // Check if cart amount is higher than the maximum amount to apply the coupon
  if (coupon.max_spend && sub_total < coupon.max_spend) {
    throw new BadRequestError(
      `The maximum spend for this coupon is ${baseCurrencySymbol}${sub_total}`
    );
  }

  // Amount to be discounted from the cart sub total
  let couponAmount = 0;

  // PERCENTAGE DISCOUNT COUPON
  if (coupon.coupon_type === CouponType.PERCENTAGE) {
    switch (coupon.coupon_apply_for) {
      case CouponApplyFor.PRODUCT:
        const couponProductIds = coupon.products.map((x) => x.product_id);
        //check each cart product
        carts.forEach((cart) => {
          const { product_id, discount, flash_discount, price } = cart.variation;
          const { qty } = cart;
          if (couponProductIds.includes(product_id)) {
            couponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
          }
        });
        break;

      case CouponApplyFor.STORE:
        const couponStoreIds = coupon.stores.map((x) => x.store_id);
        carts.forEach((cart) => {
          const { discount, price, flash_discount } = cart.variation;
          const { store_id, qty } = cart;

          if (couponStoreIds.includes(store_id)) {
            couponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
          }
        });
        break;

      case CouponApplyFor.USER:
        const couponUserIds = coupon.users.map((x) => x.user_id);
        if (couponUserIds.includes(user_id)) {
          carts.forEach((cart) => {
            const { discount, price, flash_discount } = cart.variation;
            const { qty } = cart;
            couponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
          });
        } else {
          throw new BadRequestError("You are not eligible to use this coupon");
        }
        break;

      case CouponApplyFor.USER_AND_PRODUCT: {
        const couponProductIds = coupon.products.map((x) => x.product_id); //products
        const couponUserIds = coupon.users.map((x) => x.user_id); //users

        if (couponUserIds.includes(user_id)) {
          carts.forEach((cart) => {
            const { product_id, discount, price, flash_discount } = cart.variation;
            const { qty } = cart;
            if (couponProductIds.includes(product_id)) {
              couponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
            }
          });
        } else {
          throw new BadRequestError("You are not eligible to use this coupon");
        }
        break;
      }
      case CouponApplyFor.ALL_ORDERS:
        carts.forEach((cart) => {
          const { discount, price, flash_discount } = cart.variation;
          const { qty } = cart;
          couponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
        });
        // couponAmount += userCarts.sub_total * couponPercent;
        break;
      default:
        break;
    }
    // FIXED PRICE COUPON |||
  } else if (coupon.coupon_type === CouponType.FIXED_AMOUNT) {
    // `cart subtotal` must be greater than the `coupon amount`
    if (sub_total < coupon.fixed_price_coupon_amount) {
      throw new BadRequestError(
        `The minimum cart total order for this coupon is ${baseCurrencySymbol}${coupon.fixed_price_coupon_amount}`
      );
    }
    // Restrict users not permitted to use coupon
    if (coupon.users.length) {
      const couponUserIds = coupon.users.map((x) => x.user_id);
      if (!couponUserIds.includes(user_id)) {
        throw new BadRequestError("You are not eligible to use this coupon");
      }
    }
    couponAmount = coupon.fixed_price_coupon_amount;
  }

  // For coupon with cap(max),,,Maintain the coupon amount cap
  // ie, don't allow the coupon discount to be {{ coupon_amount_without_cap }}
  return {
    coupon_amount: applyCouponCap(coupon, couponAmount),
    coupon_amount_without_cap: couponAmount,
    sub_total: sub_total,
    coupon,
  };
};

//-->  Get Store Coupon Amount
const findStoreCouponAmount = (
  coupon: CouponInstance,
  carts: CartInstance[],
  store_id: string,
  user_id: string
) => {
  let storeCouponAmount = 0;
  if (coupon.coupon_apply_for == CouponApplyFor.STORE) {
    //Check if this current store is present on the coupons stores

    const couponStoreIds = coupon.stores.map((x) => x.store_id);
    //or simply  storeCarts.forEach
    carts.forEach((cart) => {
      const { discount, price, flash_discount } = cart.variation;
      const { qty, store_id: each_store_id } = cart;

      if (couponStoreIds.includes(store_id)) {
        //if this product belongs to this store
        if (each_store_id === store_id) {
          storeCouponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
        }
      }
    });
  } else if (coupon.coupon_apply_for === CouponApplyFor.PRODUCT) {
    const couponProductIds = coupon.products.map((x) => x.product_id);
    //check each cart product
    carts.forEach((cart) => {
      const { product_id, discount, price, flash_discount } = cart.variation;
      const { store_id: each_store_id, qty } = cart;
      //if product is among the coupon products
      if (couponProductIds.includes(product_id)) {
        //if this product belongs to this store
        if (each_store_id === store_id) {
          storeCouponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
        }
      }
    });
  } else if (coupon.coupon_apply_for === CouponApplyFor.USER) {
    const couponUserIds = coupon.users.map((x) => x.user_id);
    //I have access to this coupon
    if (couponUserIds.includes(user_id)) {
      carts.forEach((cart) => {
        const { discount, price, flash_discount } = cart.variation;
        const { qty, store_id: each_store_id } = cart;
        //if this product belongs to this store
        if (each_store_id === store_id) {
          storeCouponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
        }
      });
    }
  } else if (coupon.coupon_apply_for === CouponApplyFor.USER_AND_PRODUCT) {
    const couponProductIds = coupon.products.map((x) => x.product_id); //products
    const couponUserIds = coupon.users.map((x) => x.user_id); //users

    //if I have access to this coupon
    if (couponUserIds.includes(user_id)) {
      carts.forEach((cart) => {
        const { product_id, discount, price, flash_discount } = cart.variation;
        const { store_id: each_store_id, qty } = cart;
        //if this product belongs to this coupon
        if (couponProductIds.includes(product_id)) {
          //if this product belongs to this store
          if (each_store_id === store_id) {
            storeCouponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
          }
        }
      });
    }
  } else if (coupon.coupon_apply_for === CouponApplyFor.ALL_ORDERS) {
    carts.forEach((cart) => {
      const { discount, price, flash_discount } = cart.variation;
      const { qty, store_id: each_store_id } = cart;
      //if this product belongs to this coupon
      if (each_store_id === store_id) {
        storeCouponAmount += calcCouponAmount({ coupon, qty, price, discount, flash_discount });
      }
    });
  }

  return storeCouponAmount;
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
    ...CouponUtils.sequelizeFindOptions(),
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
  const { coupon_apply_for, store_id }: { coupon_apply_for: CouponApplyFor; store_id: string } =
    req.query as any;

  if (!isAdmin(role) && !stores.includes(store_id)) {
    throw new ForbiddenError();
  }
  const where: { [k: string]: string } = {};
  if (coupon_apply_for) {
    where.coupon_apply_for = coupon_apply_for;
  }
  if (store_id) {
    where["$stores.store_id$"] = store_id;
  }

  const coupons = await Coupon.findAll({
    where,
    ...CouponUtils.sequelizeFindOptions({ limit, offset }),
  });

  return coupons;
};

//find all
const findAll = async (req: Request) => {
  const { limit, offset } = getPaginate(req.query);
  const { role } = req.user!;
  const { coupon_apply_for, search_query, store_id, user_id } = req.query as any;

  if (!isAdmin(role)) {
    throw new ForbiddenError("Not authorized to access this resources");
  }
  const where: { [k: string]: any } = {};
  if (coupon_apply_for) {
    where.coupon_apply_for = coupon_apply_for;
  }
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
    ...CouponUtils.sequelizeFindOptions({ limit, offset }),
  });

  return coupons;
};

export default {
  create,
  generateCoupon,
  revokeCoupon,
  applyCoupon,
  findStoreCouponAmount,
  validateCouponExist,
  findByCouponCode,
  findAllByStoreId,
  findAll,
};
