import { FindOptions, Op } from "sequelize";
import { Sequelize } from "sequelize";
import { ProductStatus } from "../enum/product.enum";
import {
  Category,
  Collection,
  ProductAttribute,
  ProductAttributeSets,
  ProductDiscount,
  ProductVariation,
  ProductWithAttribute,
  Store,
} from "../models";

class ProductUtils {
  static storeSubQuery = () => {
    return `(
        select (row_to_json(s))
        from (
          select 
          s.store_id, 
          s.name, 
          s.phone
          from "Store" s
          where "Product".store_id = s.store_id        
        ) s
      ) AS store`;
  };

  static imgSubQuery() {
    return `(
      select array_to_json(array_agg(row_to_json(file)))
      from (
        select file.url, file.name from "MediaFiles" file
        where file.file_id = ANY(ARRAY["Product".images])        
      ) file
    )`;
  }

  static noOfViewsSubQuery = () => {
    return `
    (
      SELECT COUNT(id) 
      FROM "ProductViews" WHERE 
      "ProductViews".product_id = "Product".product_id
    )`;
  };

  static selectQuery = (data: any) => {
    const { user_id, product_status = ProductStatus.PUBLISHED, limit, offset, extra = "", order } = data;
    const orderBy = order ?? `ORDER BY "Product".id DESC`;

    return `SELECT 
          "Product".*, 
          ${this.noOfViewsSubQuery()},
  
          -- Product Images objects array
          ${this.imgSubQuery()},
          -- User object
          -- Product Suggestions
          ${this.imgSubQuery()} as images
  
  
          FROM "Product" 
        WHERE "Product"."product_status" = '${product_status}' ${extra} 
          ${orderBy}
          LIMIT ${limit} OFFSET ${offset} 
        `;
  };

  static sequelizeFindOptions = (paginate?: { limit: number; offset: number }) => {
    const options: FindOptions = {
      ...(paginate ?? {}),
      subQuery: false,
      include: [
        { model: Store, as: "store", attributes: ["store_id", "name"], required: true },
        { model: Category, as: "categories" },
        {
          model: ProductVariation,
          as: "variations",
          include: [
            {
              model: ProductAttributeSets,
              as: "attribute_sets",
              include: [
                {
                  model: ProductAttribute,
                  as: "attribute",
                },
              ],
            },
            {
              model: ProductDiscount,
              as: "discount",
              required: false,
              where: {
                revoke: false,
                discount_from: { [Op.lt]: new Date() },
                discount_to: { [Op.or]: [{ [Op.gt]: new Date() }, null] },
              },
            },
          ],
        },
        { model: Collection, as: "collections" },
        { model: ProductWithAttribute, as: "attributes" },
      ],
      attributes: {
        include: [[Sequelize.literal(this.imgSubQuery()), "images"]],
      },
    };
    return options;
  };
}

export default ProductUtils;
