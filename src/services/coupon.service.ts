import { Request } from "express";
import sequelize, { Coupon, CouponProduct, CouponStore, CouponUser, User } from "../models";
import { NOT_FOUND } from "http-status";
import { Op } from "sequelize/dist";
import { CouponAttributes, CouponInstance } from "../models/coupon.model";
import { CouponType } from "../enum/coupon.enum";
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
import { OrderStatus } from "../enum/orders.enum";
import { CartInstance } from "../models/cart.model";
import { genUniqueColId } from "../utils/random.string";
import { isAdmin } from "../utils/admin.utils";

//--> create
const create = async (req: Request) => {
  const { user_id, role } = req.user!;
  const body: CouponAttributes & { products: CouponProductAttributes[] } & {
    stores: CouponStoreAttributes[];
  } & { users: CouponUserAttributes[] } = req.body;
  const { coupon_type, coupon_code } = body;
  body.created_by = user_id;

  if (coupon_type == CouponType.PRODUCT && body.products.length == 0) {
    throw new ErrorResponse("category(category_id) is required for CATEGORY COUPON TYPE");
  }

  if (coupon_type == CouponType.STORE && body.stores.length == 0) {
    throw new ErrorResponse("store(store_id) is required for STORE COUPON TYPE");
  }

  if (coupon_type == CouponType.USER && body.users.length == 0) {
    throw new ErrorResponse("user(user_id) is required for USER COUPON TYPE");
  }

  if (coupon_type == CouponType.USER_AND_PRODUCT && (body.users.length == 0 || body.products.length == 0)) {
    throw new ErrorResponse("users & product are required for USER_AND_PRODUCT COUPON TYPE");
  }

  //--> only admin can create all coupons
  // But stores can only create STORE & USER_AND_PRODUCT coupon
  const storeList = [CouponType.STORE, CouponType.USER_AND_PRODUCT];
  if (!storeList.includes(coupon_type) && !isAdmin(role)) {
    throw new UnauthorizedError("Not authorized to create a coupon except STORE & USER_AND_PRODUCT COUPON TYPE");
  }

  //--> for non-admin(only store)
  if (storeList.includes(coupon_type) && !isAdmin(role)) {
    //--> store should create only one STORE COUPON TYPE(One item(store) in the array)
    if (body.stores.length > 1) {
      throw new ErrorResponse("Store can only create one STORE COUPON TYPE");
    }
    //check to see if user has the said store and the store is active
    const { store_id } = body.stores[0];

    const store = await storeService.findById(store_id);
    if (store.user_id !== user_id) {
      throw new ErrorResponse(`Not authorized to create coupon on this store(${store.name})`);
    }
  }

  //--> Check(validate) coupon exist
  await validateCouponExist(coupon_code);

  try {
    sequelize.transaction(async (transaction) => {
      //--> Create coupon
      const coupon = await Coupon.create(body, { transaction });

      //--> Create respective coupon types(except for general)
      if (coupon_type === CouponType.PRODUCT) {
        const payload = body.products.map(({ product_id }) => ({
          product_id,
          coupon_code,
        }));
        await CouponProduct.bulkCreate(payload, { transaction });
      } else if (coupon_type === CouponType.STORE) {
        const payload = body.stores.map(({ store_id }) => ({
          store_id,
          coupon_code,
        }));
        await CouponStore.bulkCreate(payload, { transaction });
      } else if (coupon_type === CouponType.USER) {
        const payload = body.users.map(({ user_id }) => ({
          user_id,
          coupon_code,
        }));
        await CouponUser.bulkCreate(payload, { transaction });
      } else if (coupon_type === CouponType.USER_AND_PRODUCT) {
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
  const coupon_code = await genUniqueColId(Coupon, "coupon_code", 12, "alphanumeric", "uppercase");

  return coupon_code;
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
  // const store: StoreInstance = await storeService.findById(store_id);

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
  const futureExpires = moment(coupon.end_date).isAfter();
  if (!futureExpires) {
    throw new ErrorResponse("Coupon expired");
  }

  //check if usage limit is exceeded(if usage limit is not unlimited(not null))
  const codeOrders = await ordersService.findAllByCouponOrUser(coupon_code, undefined, OrderStatus.COMPLETED);
  if (coupon.usage_limit && codeOrders.length >= coupon.usage_limit) {
    throw new ErrorResponse("Coupon usage limit exceeded");
  }

  //check if I have used/applied this code;
  const myOrders = await ordersService.findAllByCouponOrUser(coupon_code, user_id, OrderStatus.COMPLETED);

  if (myOrders.length && myOrders.length >= coupon.usage_limit_per_user) {
    throw new ErrorResponse("You have exceeded your limit of this coupon");
  }

  const userCarts = await cartService.findAllByUserId(user_id);
  const carts = userCarts.carts;
  let couponAmount = 0;

  switch (coupon.coupon_type) {
    case CouponType.PRODUCT:
      const couponProductIds = coupon.products.map((x) => x.product_id);
      //check each product
      carts.forEach((cart) => {
        const { product_id, discount, price } = cart.variation;
        if (couponProductIds.includes(product_id)) {
          if (discount) {
            couponAmount += discount.price * coupon.percentage_discount;
          } else {
            couponAmount += price * coupon.percentage_discount;
          }
        }
      });

      break;

    case CouponType.STORE:
      const couponStoreIds = coupon.stores.map((x) => x.store_id);
      // const uniqueStores = couponStoreIds.filter((x, i, a) => a.indexOf(x) == i);
      // const uniqueStores = Array.from(new Set(couponStoreIds))

      carts.forEach((cart) => {
        const { discount, price } = cart.variation;
        const { store_id, qty } = cart;

        if (couponStoreIds.includes(store_id)) {
          //To limit to 1st product & not all, remove the qty *
          if (discount) {
            couponAmount += qty * discount.price * coupon.percentage_discount;
          } else {
            couponAmount += qty * price * coupon.percentage_discount;
          }
        }
      });
      break;

    case CouponType.USER:
      const couponUserIds = coupon.users.map((x) => x.user_id);
      if (couponUserIds.includes(user_id)) {
        carts.forEach((cart) => {
          const { discount, price } = cart.variation;
          const { qty } = cart;
          if (discount) {
            couponAmount += qty * discount.price * coupon.percentage_discount;
          } else {
            couponAmount += qty * price * coupon.percentage_discount;
          }
        });
      } else {
        throw new ErrorResponse("You are not eligible to use this coupon");
      }
      break;

    case CouponType.USER_AND_PRODUCT:
      const couponProductIds_ = coupon.products.map((x) => x.product_id); //products
      const couponUserIds_ = coupon.users.map((x) => x.user_id); //users

      if (couponUserIds_.includes(user_id)) {
        carts.forEach((cart) => {
          const { product_id, discount, price } = cart.variation;
          if (couponProductIds_.includes(product_id)) {
            if (discount) {
              couponAmount += discount.price * coupon.percentage_discount;
            } else {
              couponAmount += price * coupon.percentage_discount;
            }
          }
        });
      } else {
        throw new ErrorResponse("You are not eligible to use this coupon");
      }
      break;
    case CouponType.ALL_ORDERS:
      carts.forEach((cart) => {
        const { discount, price } = cart.variation;
        const { qty } = cart;
        if (discount) {
          couponAmount += qty * discount.price * coupon.percentage_discount;
        } else {
          couponAmount += qty * price * coupon.percentage_discount;
        }
      });
      // --> OR simply...
      // couponAmount += userCarts.sub_total * coupon.percentage_discount;
      break;

    default:
      break;
  }
  //If 0, i.e coupon was avaialble for this user or his products
  if (couponAmount == 0) {
    throw new ErrorResponse("Coupon not available for this user/orders");
  }

  return {
    coupon_amount: couponAmount,
    sub_total: userCarts.sub_total,
    coupon,
  };
};

//-->  Get Store Coupon Amount
const findStoreCouponAmount = (coupon: CouponInstance, carts: CartInstance[], store_id: string, user_id: string) => {
  let storeCouponAmount = 0;
  if (coupon.coupon_type == CouponType.STORE) {
    //Check if this current store is present on the coupons stores
    // const isStoreInCoupon = coupon.stores.find((s) => s.store_id == store_id);
    // if (isStoreInCoupon) {
    //   //Get coupon total price of this store in the cart

    //   storeCarts.forEach((cart) => {
    //     const { discount, price } = cart.variation;
    //     const { qty } = cart;
    //     if (discount) {
    //       storeCouponAmount += qty * discount.price * coupon.percentage_discount;
    //     } else {
    //       storeCouponAmount += qty * price * coupon.percentage_discount;
    //     }
    //   });
    // } else {
    //   //They will have nothing...😦😦
    // }

    //--> OR simply....
    const couponStoreIds = coupon.stores.map((x) => x.store_id);
    //or simply  storeCarts.forEach
    carts.forEach((cart) => {
      const { discount, price } = cart.variation;
      const { qty, store_id: each_store_id } = cart;

      if (couponStoreIds.includes(store_id)) {
        //if this product belongs to this store
        if (each_store_id === store_id) {
          if (discount) {
            storeCouponAmount += qty * discount.price * coupon.percentage_discount;
          } else {
            storeCouponAmount += qty * price * coupon.percentage_discount;
          }
        }
      }
    });
  } else if (coupon.coupon_type === CouponType.PRODUCT) {
    const couponProductIds = coupon.products.map((x) => x.product_id);
    //check each cart product
    carts.forEach((cart) => {
      const { product_id, discount, price } = cart.variation;
      const { store_id: each_store_id } = cart;
      //if product is among the coupon products
      if (couponProductIds.includes(product_id)) {
        //if this product belongs to this store
        if (each_store_id === store_id) {
          if (discount) {
            storeCouponAmount += discount.price * coupon.percentage_discount;
          } else {
            storeCouponAmount += price * coupon.percentage_discount;
          }
        }
      }
    });
  } else if (coupon.coupon_type === CouponType.USER) {
    const couponUserIds = coupon.users.map((x) => x.user_id);
    //I have access to this coupon
    if (couponUserIds.includes(user_id)) {
      carts.forEach((cart) => {
        const { discount, price } = cart.variation;
        const { qty, store_id: each_store_id } = cart;
        //if this product belongs to this store
        if (each_store_id === store_id) {
          if (discount) {
            storeCouponAmount += qty * discount.price * coupon.percentage_discount;
          } else {
            storeCouponAmount += qty * price * coupon.percentage_discount;
          }
        }
      });
    }
  } else if (coupon.coupon_type === CouponType.USER_AND_PRODUCT) {
    const couponProductIds_ = coupon.products.map((x) => x.product_id); //products
    const couponUserIds_ = coupon.users.map((x) => x.user_id); //users

    //if I have access to this coupon
    if (couponUserIds_.includes(user_id)) {
      carts.forEach((cart) => {
        const { product_id, discount, price } = cart.variation;
        const { store_id: each_store_id } = cart;
        //if this product belongs to this coupon
        if (couponProductIds_.includes(product_id)) {
          //if this product belongs to this store
          if (each_store_id === store_id) {
            if (discount) {
              storeCouponAmount += discount.price * coupon.percentage_discount;
            } else {
              storeCouponAmount += price * coupon.percentage_discount;
            }
          }
        }
      });
    }
  } else if (coupon.coupon_type === CouponType.ALL_ORDERS) {
    carts.forEach((cart) => {
      const { discount, price } = cart.variation;
      const { qty, store_id: each_store_id } = cart;
      //if this product belongs to this coupon
      if (each_store_id === store_id) {
        if (discount) {
          storeCouponAmount += qty * discount.price * coupon.percentage_discount;
        } else {
          storeCouponAmount += qty * price * coupon.percentage_discount;
        }
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
    include: [
      { model: CouponProduct, as: "products" },
      { model: CouponStore, as: "stores" },
      { model: CouponUser, as: "users" },
    ],
  });
  if (!coupon) {
    throw new ErrorResponse("Coupon not found", NOT_FOUND);
  }
  return coupon;
};

//--> find all by store id(or any user_id)
const findAllByStoreId = async (req: Request) => {
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { store_id } = req.params;
  const { role, stores } = req.user!;
  const { coupon_type }: { coupon_type: CouponType } = req.query as any;

  if (!isAdmin(role) && !stores.includes(store_id)) {
    throw new UnauthorizedError();
  }
  const where: { [k: string]: string } = { created_by: store_id };
  if (coupon_type) {
    where.coupon_type = coupon_type;
  }

  const coupons = await Coupon.findAll({
    where,
    limit,
    offset,
    include: [
      { model: CouponProduct, as: "products" },
      { model: CouponStore, as: "stores" },
      { model: User, as: "users" },
    ],
  });

  return coupons;
};

//find all
const findAll = async (req: Request) => {
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { role } = req.user!;
  const { coupon_type, search_query } = req.query as any;

  if (!isAdmin(role)) {
    throw new UnauthorizedError("Not authorized to access this resources");
  }
  const where: { [k: string]: any } = {};
  if (coupon_type) {
    where.coupon_type = coupon_type;
  }
  if (search_query) {
    where[Op.or as any] = [
      { coupon_code: { [Op.iLike]: `%${search_query}%` } },
      { title: { [Op.iLike]: `%${search_query}%` } },
    ];
  }
  const coupons = await Coupon.findAll({
    where,
    limit,
    offset,
    include: [
      { model: CouponProduct, as: "products" },
      { model: CouponStore, as: "stores" },
      { model: User, as: "users" },
    ],
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
