import { Request } from "express";
import { Op, Transaction } from "sequelize";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { StoreOrders, VendorSettlement } from "../ec-models";
import { VendorSettlementInstance } from "./model";
import { isAdmin } from "../ec-apps/app-admin/roles.service";
import { createModel, getPaginate } from "../ec-models/utils";

const create = async (
  store_order_ids: string[],
  amount: number,
  store_id: string,
  transaction: Transaction
) => {
  const settlement = await createModel<VendorSettlementInstance>(
    VendorSettlement,
    { store_order_ids, amount, store_id },
    "settlement_id",
    { transaction }
  );

  const processedSettlement = await processSettlement(settlement, transaction);

  return processedSettlement;
};

const adminProcessSettlement = async (req: Request) => {
  const { settlement_id } = req.params;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError("Access denied");
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
const processSettlement = async (
  settlement: VendorSettlementInstance,
  transaction?: Transaction
) => {
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
    throw new ForbiddenError("Access denied");
  }

  const store_orders = StoreOrders.findAll({
    where: { store_order_id: { [Op.in]: settlement.store_order_ids } },
  });

  return { settlement, store_orders };
};

const findAllByStoreId = async (req: Request) => {
  const { stores, role } = req.user!;
  const { store_id } = req.params;

  const paginate = getPaginate(req.query);
  if (!stores.includes(store_id) && !isAdmin(role)) {
    throw new ForbiddenError("Access denied");
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
