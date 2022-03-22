import { Request } from "express";
import { Op, Transaction } from "sequelize";
import { NotFoundError } from "../apiresponse/not.found.error";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { SubOrders, VendorSettlement } from "../models";
import { VendorSettlementInstance } from "../models/vendor.settlement.model";
import { isAdmin } from "../utils/admin.utils";
import { Helpers } from "../utils/helpers";
import { createModel } from "../utils/random.string";

const create = async (sub_order_ids: string[], amount: number, store_id: string, transaction: Transaction) => {
  const settlement = await createModel<VendorSettlementInstance>(
    VendorSettlement,
    { sub_order_ids, amount, store_id },
    "settlement_id",
    transaction
  );

  const processedSettlement = await processSettlement(settlement, transaction);

  return processedSettlement;
};

const adminProcessSettlement = async (req: Request) => {
  const { settlement_id } = req.params;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new UnauthorizedError("Access denied");
  }
  const settlement = await VendorSettlement.findOne({
    where: { settlement_id },
  });

  if (!settlement) {
    throw new NotFoundError("Settlement not found");
  }

  if (settlement.processed) {
    throw new NotFoundError("Settlement already processed");
  }

  const processedSettlement = await processSettlement(settlement);

  return processedSettlement;
};
const processSettlement = async (settlement: VendorSettlementInstance, transaction?: Transaction) => {
  if (!settlement) {
    return;
  }

  if (settlement.processed) {
    return;
  }
  /// Do any necessary money transaction here...

  settlement.processed = true;
  settlement.processed_at = new Date();
  await settlement.save({ transaction });

  return settlement.reload({ transaction });
};

const findById = async (req: Request) => {
  const { settlement_id } = req.params;
  const { stores, role } = req.user!;
  const settlement = await VendorSettlement.findOne({
    where: { settlement_id },
  });

  if (!settlement) {
    throw new NotFoundError("Settlement not found");
  }
  if (!stores.includes(settlement.store_id) && !isAdmin(role)) {
    throw new UnauthorizedError("Access denied");
  }

  const sub_orders = SubOrders.findAll({ where: { sub_order_id: { [Op.in]: settlement.sub_order_ids } } });

  return { settlement, sub_orders };
};

const findAllByStoreId = async (req: Request) => {
  const { stores, role } = req.user!;
  const { store_id } = req.params;

  const paginate = Helpers.getPaginate(req.query);
  if (!stores.includes(store_id) && !isAdmin(role)) {
    throw new UnauthorizedError("Access denied");
  }
  const settlements = await VendorSettlement.findAll({
    where: { store_id },
    ...paginate,
  });

  return settlements;
};

export default {
  create,
  adminProcessSettlement,
  findById,
  findAllByStoreId,
};
