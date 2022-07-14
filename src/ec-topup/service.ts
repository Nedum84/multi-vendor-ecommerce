import sequelize, { Topup } from "../ec-models";
import { Op, Transaction } from "sequelize";
import { TopupAttributes, TopupInstance } from "./model";
import { Request } from "express";
import transactionService from "../ec-transaction/service";
import { TransactionOperation } from "../ec-transaction/types";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { WhereFiltersOptimized } from "../ec-models/types";
import { createModel, getPaginate } from "../ec-models/utils";
import { isAdmin } from "../ec-apps/app-admin/roles.service";

const topUserAccount = async (body: Omit<TopupAttributes, "topup_id">): Promise<TopupInstance> => {
  try {
    return await sequelize.transaction(async function (transaction) {
      const topup = createTopup(body, transaction);

      // Log detail to transaction table
      await transactionService.create(
        {
          amount: body.amount,
          desc: `Wallet topup`,
          operation: TransactionOperation.ADD,
          reference_id: body.payment_reference,
          user_id: body.user_id,
        },
        transaction
      );

      return topup;
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const createTopup = async (body: Omit<TopupAttributes, "topup_id">, transaction?: Transaction) => {
  const topup = await createModel<TopupInstance>(Topup, body, "topup_id", { transaction });

  return topup;
};

const findById = async (topup_id: string) => {
  const topup = await Topup.findByPk(topup_id);
  if (!topup) {
    throw new NotFoundError("No topup found");
  }
  return topup;
};

const findByPaymentRef = async (payment_reference: string) => {
  const topup = await Topup.findOne({ where: { payment_reference } });

  return topup;
};

const findAllUser = async (req: Request) => {
  const { user_id } = req.user!;
  const { limit, offset } = getPaginate(req.query);
  const { date_from, date_to } = req.query as any;

  const where: WhereFiltersOptimized<Pick<TopupAttributes, "created_at" | "user_id">> = [
    { user_id },
  ];

  if (date_from) {
    where.push({ created_at: { [Op.gte]: date_from } as any });
  }

  if (date_to) {
    where.push({ created_at: { [Op.lte]: date_to } as any });
  }

  const topups = await Topup.findAndCountAll({
    where: { [Op.and]: where },
    order: [["created_at", "DESC"]],
    offset,
    limit,
  });

  return {
    topups: topups.rows,
    total: topups.count,
  };
};

const findAllAdmin = async (req: Request) => {
  const { role } = req.user!;
  const { limit, offset } = getPaginate(req.query);
  const { user_id, payment_channel, payment_reference, topup_id, date_from, date_to } =
    req.query as any;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const where: WhereFiltersOptimized<TopupAttributes> = [{}];

  if (user_id) {
    where.push({ user_id });
  }
  if (payment_channel) {
    where.push({ payment_channel });
  }
  if (payment_reference) {
    where.push({ payment_reference });
  }
  if (topup_id) {
    where.push({ topup_id });
  }
  if (date_from) {
    where.push({ created_at: { [Op.gte]: date_from } as any });
  }

  if (date_to) {
    where.push({ created_at: { [Op.lte]: date_to } as any });
  }

  const topups = await Topup.findAndCountAll({
    where: { [Op.and]: where },
    order: [["created_at", "DESC"]],
    offset,
    limit,
  });

  return {
    topups: topups.rows,
    total: topups.count,
  };
};
export default {
  topUserAccount,
  createTopup,
  findById,
  findByPaymentRef,
  findAllUser,
  findAllAdmin,
};
