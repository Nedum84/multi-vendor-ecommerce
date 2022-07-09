import categoryService from "./category.service";

export const categoriesChildren = async (catIds: string[]): Promise<string[]> => {
  // find all the categories & their children
  const childrenCats = await Promise.all(
    catIds.map((category_id) => categoryService.findChildren(category_id))
  );

  // Get the distinct category_ids
  const catIdSet = new Set<string>();
  childrenCats.forEach((categories) => {
    categories.forEach((cat) => catIdSet.add(cat.category_id));
  });

  return Array.from(catIdSet);
};
