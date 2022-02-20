import { Request } from "express";
import { Op } from "sequelize";
import { StoreAttributes, StoreInstance } from "../models/store.model";
import sequelize, { Store, SubOrders } from "../models";
import { NotFoundError } from "../apiresponse/not.found.error";
import { Helpers } from "../utils/helpers";
import { createModel, genSlugColId } from "../utils/random.string";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import moment from "moment";
import CONSTANTS from "../utils/constants";
import { OrderStatus } from "../enum/orders.enum";
import { isAdmin } from "../utils/admin.utils";
import { generateSlug } from "../utils/function.utils";
import userService from "./user.service";
import { UserRoleStatus } from "../enum/user.enum";
import { ErrorResponse } from "../apiresponse/error.response";

const create = async (req: Request) => {
  const body: StoreAttributes = req.body;
  const { user_id } = req.user!;

  const slug = generateSlug(body.name);
  body.slug = await genSlugColId(Store, "slug", slug);
  body.user_id = user_id;
  body.verified = true;
  body.verified_at = new Date();
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

const findById = async (store_id: string) => {
  const store = await Store.findOne({
    where: { [Op.or]: [{ store_id }, { slug: store_id }] },
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
  const { store_id, email, phone, verified, search_query } = req.query as any;
  const where: { [k: string]: any } = {};

  if (store_id) {
    where.store_id = store_id;
  }
  if (email) {
    where.email = email;
  }
  if (phone) {
    where.phone = phone;
  }
  if (verified) {
    where.verified = verified;
  }
  if (search_query) {
    where[Op.or as any] = [
      { name: { [Op.iLike]: `%${search_query}%` } },
      { email: { [Op.iLike]: `%${search_query}%` } },
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

  const TOLERABLE_PERIOD = moment(moment().unix() - CONSTANTS.GUARANTEE_PERIOD * 3600).toDate(); //days

  //pending orders ()....
  const totalPending = await SubOrders.sum("store_price", {
    where: {
      store_id,
      order_status: OrderStatus.COMPLETED,
      settled: false,
      refunded: false,
      delivered_at: { [Op.or]: [{ [Op.gt]: TOLERABLE_PERIOD }, { [Op.eq]: null }] },
    },
  });

  const totalUnsettled = await SubOrders.sum("store_price", {
    where: {
      store_id,
      delivered: true,
      settled: false,
      delivered_at: { [Op.lte]: TOLERABLE_PERIOD },
    },
  });
  const totalEarned = await SubOrders.sum("store_price", {
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
  findById,
  findUserStores,
  findAll,
  storeBalance,
};
