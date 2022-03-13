import { FindOptions, Op } from "sequelize";
import {
  FlashSales,
  FlashSalesProducts,
  Product,
  ProductAttribute,
  ProductAttributeSets,
  ProductDiscount,
} from "../models";

class ProductVariationUtils {
  static sequelizeFindOptions = (paginate?: { limit: number; offset: number }) => {
    const options: FindOptions = {
      ...(paginate ?? {}),
      subQuery: false,
      include: [
        { model: Product, as: "product" },
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
        {
          model: FlashSalesProducts,
          as: "flash_discount",
          required: false,
          include: [
            {
              model: FlashSales,
              as: "flash_sale",
              attributes: ["flash_sale_id"],
              where: {
                revoke: false,
                start_date: { [Op.lt]: new Date() },
                end_date: { [Op.or]: [{ [Op.gt]: new Date() }, null] },
              },
            },
          ],
        },
      ],
      // attributes: {
      //   include: [[Sequelize.literal(this.imgSubQuery()), "images"]],
      // },
    };
    return options;
  };
}

export default ProductVariationUtils;
