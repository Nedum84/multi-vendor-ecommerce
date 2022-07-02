class CategoryUtils {
  //get parents
  static getParentCategories = (category_id: string, direction?: string) => {
    var orderBy = "ASC";
    if (direction === "top_to_bottom") {
      orderBy = "ASC"; //default
    } else if (direction === "bottom_to_top") {
      orderBy = "DESC";
    }
    return `
      WITH RECURSIVE cte AS (
        SELECT "Category".* FROM "Category" WHERE "Category".category_id = '${category_id}'
      UNION ALL
        SELECT c.* FROM "Category" c
          INNER JOIN cte
          ON c.category_id = cte.parent_id
      )
      SELECT cte.name, cte.category_id, cte.parent_id FROM cte
      ORDER BY cte."createdAt" ${orderBy}
    `;
  };
  //get children
  static getChildCategories = (category_id: string, direction?: string) => {
    var orderBy = "ASC";
    if (direction === "top_to_bottom") {
      orderBy = "ASC"; //default
    } else if (direction === "bottom_to_top") {
      orderBy = "DESC";
    }
    return `
      WITH RECURSIVE cte AS (
        SELECT "Category".* FROM "Category" WHERE "Category".category_id = '${category_id}'
      UNION ALL
        SELECT c.* FROM "Category" c
          INNER JOIN cte
          ON c.parent_id = cte.category_id
      )
      SELECT cte.name, cte.category_id, cte.parent_id FROM cte
      ORDER BY cte."createdAt" ${orderBy}
    `;
  };
}

export default CategoryUtils;
