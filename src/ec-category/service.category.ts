import { Request } from "express";
import { QueryTypes } from "sequelize";
import { CategoryAttributes, CategoryInstance } from "./model.category";
import { createModel } from "../ec-models/utils";
import sequelize, { Category } from "../ec-models";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { ForbiddenError } from "../ec-api-response/forbidden.error";
import { isAdmin } from "../ec-apps/app-admin/roles.service";
import { getChildCategories, getParentCategories } from "./utils.query";

//-->SCOPE ADMIN ROUTE...
//--> Create category
const create = async (req: Request) => {
  const body: CategoryAttributes = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }
  //Create category
  const category = await createModel<CategoryInstance>(Category, body, "category_id");
  return category;
};

//-->SCOPE ADMIN ROUTE...
//--> Update category
const update = async (req: Request) => {
  const updateBody: CategoryAttributes = req.body;
  const { category_id } = req.params;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new ForbiddenError();
  }

  const category = await findById(category_id);

  Object.assign(category, updateBody);

  await category.save();
  return category.reload();
};

//--> Find category by ID
const findById = async (category_id: string) => {
  const category = await Category.findOne({ where: { category_id } });
  if (!category) {
    throw new NotFoundError("No category found");
  }
  return category;
};

//--> Find category categories
const findCategories = async (limit: number, offset: number, parent_id?: string) => {
  const where = parent_id ? { parent_id, active: true } : { active: true };
  const categories = await Category.findAndCountAll({
    where,
    offset,
    limit,
  });

  return {
    category: categories.rows,
    total: categories.count,
  };
};

//find parents
const findParents = async (category_id: string, direction = "top_to_bottom") => {
  const query = getParentCategories(category_id, direction);

  const parents: CategoryInstance[] = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    nest: true,
    mapToModel: true,
    model: Category,
  });
  return parents;
};

//find children
const findChildren = async (category_id: string, direction = "top_to_bottom") => {
  const query = getChildCategories(category_id, direction);

  const children: CategoryInstance[] = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    nest: true,
    mapToModel: true,
    model: Category,
  });
  return children;
};

export default {
  findById,
  findCategories,
  create,
  update,
  findParents,
  findChildren,
};
