import { Request } from "express";
import sequelize, { Coupon, CouponProduct, CouponStore, CouponUser } from "../models";
import { Op } from "sequelize";
import { CouponAttributes, CouponInstance } from "../models/coupon.model";
import { CouponApplyFor, CouponType } from "../enum/coupon.enum";
import { CouponUserAttributes } from "../models/coupon.user.model";
import moment from "moment";
import { ErrorResponse } from "../apiresponse/error.response";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { Helpers } from "../utils/helpers";
import { CouponStoreAttributes } from "../models/coupon.store.model";
import storeService from "./store.service";
import { CouponProductAttributes } from "../models/coupon.product.model";
import ordersService from "./orders.service";
import cartService from "./cart.service";
import { CartInstance } from "../models/cart.model";
import { isAdmin } from "../utils/admin.utils";
import productService from "./product.service";
import { NotFoundError } from "../apiresponse/not.found.error";
import CouponUtils from "../utils/coupon.utils";

//--> create
const create = async (req: Request) => {
  const { user_id, role, stores } = req.user!;
  const body: CouponAttributes & { products: CouponProductAttributes[] } & {
    stores: CouponStoreAttributes[];
  } & { users: CouponUserAttributes[] } = req.body;
  const { coupon_apply_for, coupon_code, coupon_type } = body;
  body.created_by = user_id;

  if (coupon_apply_for == CouponApplyFor.PRODUCT && body.products.length == 0) {
    throw new ErrorResponse("category(category_id) is required for CATEGORY COUPON TYPE");
  }

  if (coupon_apply_for == CouponApplyFor.STORE && body.stores.length == 0) {
    throw new ErrorResponse("store(store_id) is required for STORE COUPON TYPE");
  }

  if (coupon_apply_for == CouponApplyFor.USER && body.users.length == 0) {
    throw new ErrorResponse("user(user_id) is required for USER COUPON TYPE");
  }

  if (coupon_apply_for == CouponApplyFor.USER_AND_PRODUCT && (body.users.length == 0 || body.products.length == 0)) {
    throw new ErrorResponse("users & product are required for USER_AND_PRODUCT COUPON TYPE");
  }
  if (coupon_type !== CouponType.PERCENTAGE) {
    throw new ErrorResponse("Only percentage discount is available at the moment");
  }

  //--> only admin can create all coupons
  // But stores can only create STORE, PRODUCT & USER_AND_PRODUCT coupon
  const storeList = [CouponApplyFor.STORE, CouponApplyFor.PRODUCT, CouponApplyFor.USER_AND_PRODUCT];
  if (!storeList.includes(coupon_apply_for) && !isAdmin(role)) {
    throw new UnauthorizedError(
      "Not authorized to create a coupon except STORE, PRODUCT & USER_AND_PRODUCT COUPON TYPE"
    );
  }

  //--> for non-admin(only store)
  if (storeList.includes(coupon_apply_for) && !isAdmin(role)) {
    if (coupon_apply_for === CouponApplyFor.STORE) {
      //--> store should create only one STORE COUPON TYPE(One item(store) in the array)
      if (body.stores.length > 1) {
        throw new ErrorResponse("Store can only create one STORE COUPON TYPE");
      }
      //check to see if user has the said store and the store is active
      const { store_id } = body.stores[0];

      const store = await storeService.findById(store_id);
      if (store.user_id !== user_id) {
        //OR !stores.includes(store_id)
        throw new ErrorResponse(`Not authorized to create coupon on this store(${store.name})`);
      }
    } else if (coupon_code === CouponApplyFor.PRODUCT || coupon_code === CouponApplyFor.USER_AND_PRODUCT) {
      const products = await Promise.all(
        body.products.map(({ product_id }) => {
          return productService.findById(product_id);
        })
      );

      products.forEach((product) => {
        if (!stores.includes(product.store_id)) {
          throw new ErrorResponse(`Not authorized to create coupon on this product(${product.name})`);
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
    throw new ErrorResponse(error);
  }

  return findByCouponCode(coupon_code);
};

/**  Generate coupon */
const generateCoupon = async () => {
  return CouponUtils.generateCoupon();
};
/**  Destroy coupon */
const revokeCoupon = async (req: Request) => {
  const { user_id, role } = req.user!;

  const { coupon_code } = req.body;
  const coupon = await findByCouponCode(coupon_code);

  if (coupon.created_by !== user_id && !isAdmin(role)) {
    throw new UnauthorizedError("Not authorized to revoke this coupon");
  }

  coupon.revoke = true;
  await coupon.save();
  return findByCouponCode(coupon_code);
};

//-->  apply coupon
const applyCoupon = async (user_id: string, coupon_code: string) => {
  const coupon = await findByCouponCode(coupon_code);

  if (coupon.revoke) {
    throw new UnauthorizedError("This coupon is no longer available");
  }

  //Check if start date has reached
  const beforeStart = moment(coupon.start_date).isAfter();
  if (beforeStart) {
    throw new ErrorResponse("Can not use this coupon yet");
  }
  //Check if date is future or past(expired)
  if (coupon.end_date) {
    const futureExpires = moment(coupon.end_date).isAfter();
    if (!futureExpires) {
      throw new ErrorResponse("Coupon expired");
    }
  }

  //check if usage limit is exceeded(if usage limit is not unlimited(not null))
  if (coupon.usage_limit) {
    const codeOrders = await ordersService.findAllByCouponOrUser(coupon_code);
    if (codeOrders.length >= coupon.usage_limit) {
      throw new ErrorResponse("Coupon usage limit exceeded");
    }
  }
  //check if I have used/applied this code more than each user limit
  if (coupon.usage_limit_per_user) {
    const myOrders = await ordersService.findAllByCouponOrUser(coupon_code, user_id);
    if (myOrders.length && myOrders.length >= coupon.usage_limit_per_user) {
      throw new ErrorResponse("You have exceeded your limit of this coupon");
    }
  }
  if (coupon.coupon_type !== CouponType.PERCENTAGE) {
    throw new ErrorResponse("Only percentage discount is available at the moment");
  }

  const { carts, sub_total } = await cartService.findAllByUserId(user_id);
  let couponAmount = 0;

  switch (coupon.coupon_apply_for) {
    case CouponApplyFor.PRODUCT:
      const couponProductIds = coupon.products.map((x) => x.product_id);
      //check each cart product
      carts.forEach((cart) => {
        const { product_id, discount, flash_discount, price } = cart.variation;
        const { qty } = cart;
        if (couponProductIds.includes(product_id)) {
          // if (discount) {
          //   couponAmount += qty * discount.price * couponPercent;
          // } else {
          //   couponAmount += qty * price * couponPercent;
          // }

          couponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
        }
      });
      break;

    case CouponApplyFor.STORE:
      const couponStoreIds = coupon.stores.map((x) => x.store_id);

      carts.forEach((cart) => {
        const { discount, price, flash_discount } = cart.variation;
        const { store_id, qty } = cart;

        if (couponStoreIds.includes(store_id)) {
          couponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
        }
      });
      break;

    case CouponApplyFor.USER:
      const couponUserIds = coupon.users.map((x) => x.user_id);
      if (couponUserIds.includes(user_id)) {
        carts.forEach((cart) => {
          const { discount, price, flash_discount } = cart.variation;
          const { qty } = cart;
          couponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
        });
      } else {
        throw new ErrorResponse("You are not eligible to use this coupon");
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
            couponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
          }
        });
      } else {
        throw new ErrorResponse("You are not eligible to use this coupon");
      }
      break;
    }
    case CouponApplyFor.ALL_ORDERS:
      carts.forEach((cart) => {
        const { discount, price, flash_discount } = cart.variation;
        const { qty } = cart;
        couponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
      });
      // --> OR simply...
      // couponAmount += userCarts.sub_total * couponPercent;
      break;

    default:
      break;
  }

  //If 0, i.e coupon was avaialble for this user or his products
  if (couponAmount == 0) {
    throw new ErrorResponse("Coupon not available for this user/product/orders");
  }

  // For coupon with cap(max),,,Maintain the coupon amount cap
  // ie, don't allow the coupon discount to be {{ coupon_amount_without_cap }}
  return {
    coupon_amount: CouponUtils.applyCouponCap(coupon, couponAmount),
    coupon_amount_without_cap: couponAmount,
    sub_total: sub_total,
    coupon,
  };
};

//-->  Get Store Coupon Amount
const findStoreCouponAmount = (coupon: CouponInstance, carts: CartInstance[], store_id: string, user_id: string) => {
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
          // if (discount) {
          //   storeCouponAmount += qty * discount.price * coupon.percentage_discount;
          // } else {
          //   storeCouponAmount += qty * price * coupon.percentage_discount;
          // }
          storeCouponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
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
          storeCouponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
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
          storeCouponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
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
            storeCouponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
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
        storeCouponAmount += CouponUtils.calcCouponAmount(coupon, qty, price, discount, flash_discount);
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
    throw new ErrorResponse(`Coupon not available`);
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
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { role, stores } = req.user!;
  const { coupon_apply_for, store_id }: { coupon_apply_for: CouponApplyFor; store_id: string } = req.query as any;

  if (!isAdmin(role) && !stores.includes(store_id)) {
    throw new UnauthorizedError();
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
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { role } = req.user!;
  const { coupon_apply_for, search_query, store_id, user_id } = req.query as any;

  if (!isAdmin(role)) {
    throw new UnauthorizedError("Not authorized to access this resources");
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
