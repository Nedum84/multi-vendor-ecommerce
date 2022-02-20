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
import productService from "./product.service";
import { NotFoundError } from "../apiresponse/not.found.error";
import { ProductDiscountInstance } from "../models/product.discount.model";

//--> create
const create = async (req: Request) => {
  const { user_id, role, stores } = req.user!;
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
    if (coupon_type === CouponType.STORE) {
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
    } else if (coupon_code === CouponType.USER_AND_PRODUCT) {
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
  const codeOrders = await ordersService.findAllByCouponOrUser(coupon_code, undefined, OrderStatus.COMPLETED);
  if (coupon.usage_limit && codeOrders.length >= coupon.usage_limit) {
    throw new ErrorResponse("Coupon usage limit exceeded");
  }
  //check if I have used/applied this code;
  const myOrders = await ordersService.findAllByCouponOrUser(coupon_code, user_id, OrderStatus.COMPLETED);

  if (myOrders.length && myOrders.length >= coupon.usage_limit_per_user) {
    throw new ErrorResponse("You have exceeded your limit of this coupon");
  }

  const { carts, sub_total } = await cartService.findAllByUserId(user_id);

  carts.forEach(({ variation, qty }, idx) => {
    console.log(`#${idx + 1}PRICE: Qty(${qty})`, variation.price, `#DISCOUNT: `, variation.discount?.price);
  });

  let couponAmount = 0;

  switch (coupon.coupon_type) {
    case CouponType.PRODUCT:
      const couponProductIds = coupon.products.map((x) => x.product_id);
      //check each product
      carts.forEach((cart) => {
        const { product_id, discount, price } = cart.variation;
        const { qty } = cart;
        if (couponProductIds.includes(product_id)) {
          // if (discount) {
          //   couponAmount += qty * discount.price * couponPercent;
          // } else {
          //   couponAmount += qty * price * couponPercent;
          // }

          couponAmount += calcCouponAmount(coupon, qty, price, discount);
        }
      });
      break;

    case CouponType.STORE:
      const couponStoreIds = coupon.stores.map((x) => x.store_id);

      carts.forEach((cart) => {
        const { discount, price } = cart.variation;
        const { store_id, qty } = cart;

        if (couponStoreIds.includes(store_id)) {
          // if (discount) {
          //   couponAmount += qty * discount.price * couponPercent;
          // } else {
          //   couponAmount += qty * price * couponPercent;
          // }
          couponAmount += calcCouponAmount(coupon, qty, price, discount);
        }
      });
      break;

    case CouponType.USER:
      const couponUserIds = coupon.users.map((x) => x.user_id);
      if (couponUserIds.includes(user_id)) {
        carts.forEach((cart) => {
          const { discount, price } = cart.variation;
          const { qty } = cart;
          // if (discount) {
          //   couponAmount += qty * discount.price * couponPercent;
          // } else {
          //   couponAmount += qty * price * couponPercent;
          // }
          couponAmount += calcCouponAmount(coupon, qty, price, discount);
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
          const { qty } = cart;
          if (couponProductIds_.includes(product_id)) {
            // if (discount) {
            //   couponAmount += qty * discount.price * couponPercent;
            // } else {
            //   couponAmount += qty * price * couponPercent;
            // }
            couponAmount += calcCouponAmount(coupon, qty, price, discount);
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
        // if (discount) {
        //   couponAmount += qty * discount.price * couponPercent;
        // } else {
        //   couponAmount += qty * price * couponPercent;
        // }
        couponAmount += calcCouponAmount(coupon, qty, price, discount);
      });
      // --> OR simply...
      // couponAmount += userCarts.sub_total * couponPercent;
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
    sub_total: sub_total,
    coupon,
  };
};

/**
 * Calculates coupon amount using coupon, product (variation) & cart xtericts/properties/values
 * @param coupon CouponInstance
 * @param qty Cart Qty
 * @param price Product(Variation) Price
 * @param discount Discount Price(If any)
 * @returns coupon amount
 */
const calcCouponAmount = (coupon: CouponInstance, qty: number, price: number, discount?: ProductDiscountInstance) => {
  const { product_qty_limit, percentage_discount } = coupon; //no of prod to apply coupon to
  const couponPercent = percentage_discount / 100;

  //Qty to be applied
  let couponableQty: number = 0;
  if (product_qty_limit) {
    //Check if the cart qty is gt than product_qty_limit
    if (qty > product_qty_limit) {
      //if gt, use product_qty_limit
      couponableQty = product_qty_limit;
    } else {
      //else use cart qty
      couponableQty = qty;
    }
  } else {
    //check if product_qty_limit is not set, use cart qty
    couponableQty = qty;
  }

  if (discount) {
    return couponableQty * discount.price * couponPercent;
  } else {
    return couponableQty * price * couponPercent;
  }

  // OR
  //if discount,
  // if (discount) {
  //   //check if product_qty_limit is set
  //   if (product_qty_limit) {
  //     //Check if the cart qty is gt than product_qty_limit
  //     if (qty > product_qty_limit) {
  //       //if gt, use product_qty_limit
  //       return product_qty_limit * discount.price * couponPercent;
  //     } else {
  //       //else use cart qty
  //       return qty * discount.price * couponPercent;
  //     }
  //   } else {
  //     //check if product_qty_limit is not set, use cart qty
  //     return qty * discount.price * couponPercent;
  //   }
  // } else {
  //   //check if product_qty_limit is set
  //   if (product_qty_limit) {
  //     //Check if the cart qty is gt than product_qty_limit
  //     if (qty > product_qty_limit) {
  //       //if gt, use product_qty_limit
  //       return product_qty_limit * price * couponPercent;
  //     } else {
  //       //else use cart qty
  //       return qty * price * couponPercent;
  //     }
  //   } else {
  //     //check if product_qty_limit is not set, use cart qty
  //     return qty * price * couponPercent;
  //   }
  // }
};
//-->  Get Store Coupon Amount
const findStoreCouponAmount = (coupon: CouponInstance, carts: CartInstance[], store_id: string, user_id: string) => {
  let storeCouponAmount = 0;
  if (coupon.coupon_type == CouponType.STORE) {
    //Check if this current store is present on the coupons stores

    const couponStoreIds = coupon.stores.map((x) => x.store_id);
    //or simply  storeCarts.forEach
    carts.forEach((cart) => {
      const { discount, price } = cart.variation;
      const { qty, store_id: each_store_id } = cart;

      if (couponStoreIds.includes(store_id)) {
        //if this product belongs to this store
        if (each_store_id === store_id) {
          // if (discount) {
          //   storeCouponAmount += qty * discount.price * coupon.percentage_discount;
          // } else {
          //   storeCouponAmount += qty * price * coupon.percentage_discount;
          // }
          storeCouponAmount += calcCouponAmount(coupon, qty, price, discount);
        }
      }
    });
  } else if (coupon.coupon_type === CouponType.PRODUCT) {
    const couponProductIds = coupon.products.map((x) => x.product_id);
    //check each cart product
    carts.forEach((cart) => {
      const { product_id, discount, price } = cart.variation;
      const { store_id: each_store_id, qty } = cart;
      //if product is among the coupon products
      if (couponProductIds.includes(product_id)) {
        //if this product belongs to this store
        if (each_store_id === store_id) {
          storeCouponAmount += calcCouponAmount(coupon, qty, price, discount);
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
          storeCouponAmount += calcCouponAmount(coupon, qty, price, discount);
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
        const { store_id: each_store_id, qty } = cart;
        //if this product belongs to this coupon
        if (couponProductIds_.includes(product_id)) {
          //if this product belongs to this store
          if (each_store_id === store_id) {
            storeCouponAmount += calcCouponAmount(coupon, qty, price, discount);
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
        storeCouponAmount += calcCouponAmount(coupon, qty, price, discount);
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
    throw new NotFoundError("Coupon not found");
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
