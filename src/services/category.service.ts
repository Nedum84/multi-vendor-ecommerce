import { Request } from "express";
import CategoryUtils from "../utils/category.utils";
import { QueryTypes } from "sequelize/dist";
import { CategoryAttributes, CategoryInstance } from "../models/category.model";
import { createModel } from "../utils/random.string";
import sequelize, { Category } from "../models";
import { NotFoundError } from "../apiresponse/not.found.error";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { isAdmin } from "../utils/admin.utils";

//-->SCOPE ADMIN ROUTE...
//--> Create category
const create = async (req: Request) => {
  const body: CategoryAttributes = req.body;
  const { role } = req.user!;

  if (!isAdmin(role)) {
    throw new UnauthorizedError();
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
    throw new UnauthorizedError();
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
  const query = CategoryUtils.getParentCategories(category_id, direction);

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
  const query = CategoryUtils.getChildCategories(category_id, direction);

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
