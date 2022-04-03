import { Request } from "express";
import { Op, Transaction } from "sequelize";
import { StoreAttributes, StoreInstance } from "../models/store.model";
import sequelize, { Product, Store, StoreOrders } from "../models";
import { NotFoundError } from "../apiresponse/not.found.error";
import { Helpers } from "../utils/helpers";
import { createModel, genSlugColId } from "../utils/random.string";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import CONSTANTS from "../utils/constants";
import { OrderStatus } from "../enum/orders.enum";
import { isAdmin } from "../utils/admin.utils";
import { generateSlug } from "../utils/function.utils";
import userService from "./user.service";
import { UserRoleStatus } from "../enum/user.enum";
import { ErrorResponse } from "../apiresponse/error.response";
import { ProductStatus } from "../enum/product.enum";

const create = async (req: Request) => {
  const body: StoreAttributes = req.body;
  const { user_id } = req.user!;

  const slug = generateSlug(body.name);
  body.slug = await genSlugColId(Store, "slug", slug);
  body.user_id = user_id;
  const store = await createModel<StoreInstance>(Store, body, "store_id");
  return store;
};

const update = async (req: Request) => {
  const { store_id } = req.params;
  const body: StoreAttributes = req.body;

  const { stores } = req.user!;
  if (!stores.includes(store_id)) {
    throw new UnauthorizedError("Access denied");
  }
  const store = await findById(store_id);

  Object.assign(store, body);
  await store.save();
  return store.reload();
};

const adminVerifyStore = async (req: Request) => {
  const { store_id } = req.params;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }
  const store = await findById(store_id);

  if (store.verified) {
    throw new ErrorResponse("Store already verified");
  }

  const user = await userService.findById(store.user_id);

  try {
    return sequelize.transaction(async (transaction) => {
      if (user.role != UserRoleStatus.VENDOR) {
        user.role = UserRoleStatus.VENDOR;
        await user.save({ transaction });
      }

      store.verified = true;
      store.verified_at = new Date();
      await store.save({ transaction });
      return store.reload({ transaction });
    });
  } catch (error: any) {
    throw new ErrorResponse(error);
  }
};
const adminUpdateStore = async (req: Request) => {
  const { store_id } = req.params;
  const { role } = req.user!;
  const { body }: { body: StoreAttributes } = req;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
  }
  const store = await findById(store_id);
  //Disable store products
  if (body.disable_store && !store.disable_store) {
    await Product.update({ status: ProductStatus.PENDING }, { where: { store_id } });
  }
  //update store
  Object.assign(store, body);
  await store.save();
  return findById(store_id);
};

const findById = async (store_id: string, transaction?: Transaction) => {
  const store = await Store.findOne({
    where: { [Op.or]: [{ store_id }, { slug: store_id }] },
    transaction,
  });

  if (!store) {
    throw new NotFoundError("store not found");
  }

  return store;
};
const findUserStores = async (user_id: string, verified?: boolean) => {
  const options = verified ? { verified } : {};
  const store = await Store.findAll({ where: { user_id, ...options } });

  return store;
};

const findAll = async (req: Request) => {
  const { limit, offset } = Helpers.getPaginate(req.query);
  const { store_id, verified, search_query } = req.query as any;
  const where: { [k: string]: any } = {};

  if (store_id) {
    where.store_id = store_id;
  }
  if (verified) {
    where.verified = verified;
  }
  if (search_query) {
    where[Op.or as any] = [
      { name: { [Op.iLike]: `%${search_query}%` } },
      { email: { [Op.iLike]: `%${search_query}%` } },
      { phone: { [Op.iLike]: `%${search_query}%` } },
    ];
  }

  const stores = await Store.findAll({ where, limit, offset });
  return stores;
};

//--> store/Vendor Balance
const storeBalance = async (req: Request) => {
  const { stores, role } = req.user!;
  const { store_id } = req.params;

  if (!stores.includes(store_id) && !isAdmin(role)) {
    throw new UnauthorizedError("Access denied");
  }

  const RETURNABLE_PERIOD = CONSTANTS.RETURNABLE_PERIOD;

  //Completed orders{{ OrderStatus.COMPLETED }}, not setled, not refunded, may/maynot be delivered
  //if delivered, the returnable days have not passed
  const totalPending = await StoreOrders.sum("store_price", {
    where: {
      store_id,
      order_status: OrderStatus.COMPLETED,
      settled: false,
      refunded: false,
      delivered_at: { [Op.or]: [{ [Op.gt]: RETURNABLE_PERIOD }, { [Op.eq]: null }] },
    },
  });

  //Order delivered & returnable days passed
  //awaiting admins settlement
  const totalUnsettled = await StoreOrders.sum("store_price", {
    where: {
      store_id,
      delivered: true,
      settled: false,
      delivered_at: { [Op.lte]: RETURNABLE_PERIOD },
    },
  });
  //Total orders settled
  const totalEarned = await StoreOrders.sum("store_price", {
    where: {
      store_id,
      order_status: OrderStatus.COMPLETED,
      settled: true,
      refunded: false,
    },
  });

  return {
    total_earned: totalEarned,
    total_pending: totalPending,
    total_unsettled: totalUnsettled,
  };
};

export default {
  create,
  update,
  adminVerifyStore,
  adminUpdateStore,
  findById,
  findUserStores,
  findAll,
  storeBalance,
};
