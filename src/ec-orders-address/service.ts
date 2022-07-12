import { Request } from "express";
import { Transaction } from "sequelize";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { OrdersAddress } from "../ec-models";
import { UserAddressInstance } from "../ec-user-address/model";
import { isAdmin } from "../ec-apps/app-admin/roles.service";
import ordersService from "../ec-orders/service";
import { getPaginate } from "../ec-models/utils";

const create = async (
  userAddress: UserAddressInstance,
  order_id: string,
  transaction: Transaction
) => {
  const address = await OrdersAddress.create(
    { order_id, ...userAddress?.toJSON() },
    { transaction }
  );
  return address;
};

const findAll = async (req: Request) => {
  const { role, user_id } = req.user!;
  const { order_id, email } = req.query as any;
  const paginate = getPaginate(req.query);

  if ((order_id || email) && !isAdmin(role)) {
    const order = await ordersService.findById(order_id);
    if (order.purchased_by != user_id) {
      throw new ForbiddenError();
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
