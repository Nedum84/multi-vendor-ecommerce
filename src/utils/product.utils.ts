import { FindOptions } from "sequelize";
import { Sequelize } from "sequelize";
import { ProductStatus } from "../enum/product.enum";
import { Category, ProductVariation, ProductWithAttribute, Store } from "../models";

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

  static sequelizeFindOptions = (prop: { limit: number; offset: number }) => {
    const { limit, offset } = prop;
    const options: FindOptions = {
      limit,
      offset,
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["store_id", "name"],
        },
        {
          model: Category,
          as: "category",
        },
        {
          model: ProductVariation,
          as: "variations",
        },
        {
          model: ProductWithAttribute,
          as: "attributes",
        },
      ],
      attributes: {
        include: [
          // [Sequelize.literal(this.noOfViewsSubQuery()), "no_of_views"],
          [Sequelize.literal(this.imgSubQuery()), "images"],
        ],
      },
    };
    return options;
  };
}

export default ProductUtils;
