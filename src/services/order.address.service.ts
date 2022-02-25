import { Request } from "express";
import { Transaction } from "sequelize/dist";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { OrdersAddress } from "../models";
import { UserAddressInstance } from "../models/user.address.model";
import { isAdmin } from "../utils/admin.utils";
import { Helpers } from "../utils/helpers";
import ordersService from "./orders.service";

const create = async (userAddress: UserAddressInstance, order_id: string, transaction: Transaction) => {
  const address = await OrdersAddress.create({ order_id, ...userAddress?.toJSON() }, { transaction });
  return address;
};

const findAll = async (req: Request) => {
  const { role, user_id } = req.user!;
  const { order_id, email } = req.query as any;
  const paginate = Helpers.getPaginate(req.query);

  if ((order_id || email) && !isAdmin(role)) {
    const order = await ordersService.findById(order_id);
    if (order.purchased_by != user_id) {
      throw new UnauthorizedError();
    }
  }

  const where: { [k: string]: any } = {};
  if (order_id) {
    where.order_id = order_id;
  }
  if (email) {
    where.email = email;
  }
  const addresses = await OrdersAddress.findAll({
    where,
    ...paginate,
  });
  return addresses;
};

export default {
  create,
  findAll,
};
