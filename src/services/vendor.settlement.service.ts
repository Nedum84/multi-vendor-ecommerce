import { Op, Transaction } from "sequelize/dist";
import { NotFoundError } from "../apiresponse/not.found.error";
import { SubOrders, VendorSettlement } from "../models";
import { VendorSettlementInstance } from "../models/vendor.settlement.model";
import { Paginate } from "../utils/helpers";
import { createModel } from "../utils/random.string";

const create = async (sub_order_ids: string[], total: number, store_id: string, transaction: Transaction) => {
  const settlement = await createModel<VendorSettlementInstance>(
    VendorSettlement,
    { sub_order_ids, total, store_id },
    "settlement_id",
    transaction
  );

  return settlement;
};

const findById = async (settlement_id: string) => {
  const settlement = await VendorSettlement.findOne({
    where: { settlement_id },
  });

  if (!settlement) {
    throw new NotFoundError("Settlement not found");
  }

  const sub_orders = SubOrders.findAll({ where: { sub_order_id: { [Op.in]: settlement.sub_order_ids } } });

  return { settlement, sub_orders };
};

const findAllByStoreId = async (store_id: string, paginate: Paginate) => {
  const settlements = await VendorSettlement.findAll({
    where: { store_id },
    ...paginate,
  });

  return settlements;
};

export default {
  create,
  findById,
  findAllByStoreId,
};
