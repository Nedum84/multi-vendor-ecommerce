import { Request } from "express";
import { FlashSales, FlashSalesProducts } from "../ec-models";
import { createModel, getPaginate } from "../ec-models/utils";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { Op } from "sequelize";
import { isAdmin } from "../ec-admin/roles.service";
import { FlashSalesAttributes, FlashSalesInstance } from "./flash.sales.model";
import { FlashSalesProductsAttributes } from "./flash.sales.products.model";

const createFlashSale = async (req: Request) => {
  const body: FlashSalesAttributes = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const checkExist = await FlashSales.findOne({
    where: {
      revoke: false,
      start_date: { [Op.lt]: new Date() },
      end_date: { [Op.or]: [{ [Op.gt]: new Date() }, null as any] },
    },
  });
  if (checkExist) {
    throw new BadRequestError(
      "Previous flash sale is already active. Closed previous flash sales to create new one"
    );
  }

  const flash = await createModel<FlashSalesInstance>(FlashSales, body, "flash_sale_id");

  return flash;
};

const updateFlashSale = async (req: Request) => {
  const { role } = req.user!;
  const { flash_sale_id } = req.params;
  const body: FlashSalesAttributes = req.body;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const flashSale = await findById(flash_sale_id);

  if (body.start_date) {
    if (body.end_date) {
      if (body.start_date >= body.end_date) {
        throw new BadRequestError(`End date must be higher than start date`);
      }
    } else {
      if (body.start_date >= flashSale.end_date) {
        throw new BadRequestError(`End date must be higher than start date`);
      }
    }
  }
  if (body.end_date) {
    if (body.end_date < new Date()) {
      throw new BadRequestError(`End date must be future date`);
    }
  }

  Object.assign(flashSale, body);
  await flashSale.save();
  return flashSale.reload();
};
const revokeFlashSale = async (req: Request) => {
  const { role } = req.user!;
  const { flash_sale_id } = req.params!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const flashSale = await findById(flash_sale_id);

  if (flashSale) {
    flashSale.revoke = true;
    await flashSale.save();
  }

  return flashSale;
};
const findById = async (flash_sale_id: string) => {
  const flashSale = await FlashSales.findOne({
    where: { flash_sale_id },
  });
  if (!flashSale) {
    throw new NotFoundError("Flashsale not found");
  }

  return flashSale;
};

const findAll = async (req: Request) => {
  const { role } = req.user!;
  const paginate = getPaginate(req.query);

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }
  const all = await FlashSales.findAll({
    order: [["createdAt", "DESC"]],
    ...paginate,
  });

  return all;
};

//FlashSale Products...
const upsertFlashSaleProducts = async (req: Request) => {
  const { role } = req.user!;
  const { flash_sale_id } = req.params!;
  const body: FlashSalesProductsAttributes[] = req.body;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const payload = body.map((flash) => ({
    ...flash,
    flash_sale_id,
  }));

  const upsert = await FlashSalesProducts.bulkCreate(payload, {
    updateOnDuplicate: ["qty", "price", "index"],
  });

  return upsert;
};

const removeFlashSaleProduct = async (req: Request) => {
  const { role } = req.user!;
  const { flash_sale_id }: { flash_sale_id: string } = req.params as any;
  const { variation_id }: { variation_id: string } = req.body;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }
  const destroy = await FlashSalesProducts.destroy({
    where: {
      variation_id,
      flash_sale_id,
    },
  });

  return !!destroy;
};
const findFlashProduct = async (flash_sale_id: string) => {
  const flashSaleProduct = await FlashSalesProducts.findAll({ where: { flash_sale_id } });

  return flashSaleProduct;
};

export default {
  createFlashSale,
  updateFlashSale,
  revokeFlashSale,
  findById,
  findAll,
  upsertFlashSaleProducts,
  removeFlashSaleProduct,
  findFlashProduct,
};
