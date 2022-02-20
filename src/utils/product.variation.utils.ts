import { FindOptions, Op } from "sequelize";
import { Product, ProductAttribute, ProductAttributeSets, ProductDiscount } from "../models";

class ProductVariationUtils {
  static sequelizeFindOptions = (paginate?: { limit: number; offset: number }) => {
    const options: FindOptions = {
      ...(paginate ?? {}),
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
      ],
      // attributes: {
      //   include: [[Sequelize.literal(this.imgSubQuery()), "images"]],
      // },
    };
    return options;
  };
}

export default ProductVariationUtils;
