import { Model, Optional, DataTypes, Sequelize } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ProductStatus } from "./types";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { CategoryInstance } from "../ec-category/model.category";
import { CollectionInstance } from "../ec-collection/model.collection";
import { ProductVariationInstance } from "../ec-product-variation/model";
import { TagInstance } from "../ec-tag/model.tag";

export interface ProductAttributes {
  product_id: string;
  name: string;
  slug: string;
  desc: string;
  images: string[];
  status: ProductStatus;
  is_featured: boolean;
  store_id: string;
  is_approved: boolean;
  approved_by: string;
  created_by: string;
  country: string;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "product_id"> {}

export interface ProductInstance
  extends Model<ProductAttributes, ProductCreationAttributes>,
    ProductAttributes {
  variations: ProductVariationInstance[];
  collections: CollectionInstance[];
  categories: CategoryInstance[];
  tags: TagInstance[];
}

//--> Model attributes
export const ProductModelAttributes: SequelizeAttributes<ProductAttributes> = {
  product_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  desc: DataTypes.TEXT,
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(ProductStatus),
    defaultValue: ProductStatus.PENDING,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approved_by: {
    type: DataTypes.STRING,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: "ng",
  },
};
export function ProductFactory(sequelize: Sequelize) {
  const Product = <ModelStatic<ProductInstance>>sequelize.define(
    "Product",
    ProductModelAttributes as any,
    {
      timestamps: true,
      tableName: "Product",
      freezeTableName: true,
      paranoid: true,
      defaultScope: {},
      scopes: {
        basic: {
          attributes: ["name"],
        },
      },
      indexes: [
        { fields: ["name"] },
        { fields: ["store_id"] },
        {
          fields: ["status", "slug"],
        },
      ],
    }
  );

  Product.associate = function (models: ModelRegistry) {
    const { Product } = models;

    Product.hasMany(models.ProductWithAttribute, {
      as: "attributes",
      foreignKey: "product_id",
      sourceKey: "product_id",
    });
    Product.hasMany(models.ProductVariation, {
      as: "variations",
      foreignKey: "product_id",
      sourceKey: "product_id",
    });
    Product.belongsTo(models.Store, {
      as: "store",
      foreignKey: "store_id",
      targetKey: "store_id",
    });
    Product.belongsTo(models.User, {
      as: "author",
      foreignKey: "created_by",
      targetKey: "user_id",
    });
    Product.belongsTo(models.User, {
      as: "approved_user",
      foreignKey: "approved_by",
      targetKey: "user_id",
    });
    Product.belongsToMany(models.Category, {
      as: "categories",
      through: models.CategoryProduct,
      foreignKey: "product_id",
      targetKey: "category_id",
    });
    Product.belongsToMany(models.Tag, {
      as: "tags",
      through: models.TagProduct,
      foreignKey: "product_id",
      targetKey: "tag_id",
    });
    Product.belongsToMany(models.Collection, {
      as: "collections",
      through: models.CollectionProduct,
      // through: models.CollectionProduct.tableName,
      foreignKey: "product_id",
      targetKey: "collection_id",
    });
    Product.hasMany(models.Wishlist, {
      as: "wishlists",
      foreignKey: "product_id",
      sourceKey: "product_id",
    });
    Product.hasMany(models.RelatedProduct, {
      as: "related_products",
      foreignKey: "related_product_id",
      sourceKey: "product_id",
    });
  };
  Product.prototype.toJSON = function () {
    const values = { ...this.get() };
    const exclude = ["version", "id"];
    exclude.forEach((e) => delete values[e]);
    return values;
  };

  Product.addHook("afterFind", (findResult) => {
    if (!findResult) return;
    if (!(findResult instanceof Array)) findResult = [findResult];

    // Set final price for product variation
    for (const product of findResult) {
      // @ts-ignore
      if (!product.variations) return;
      // @ts-ignore
      product.variations.forEach((variation: ProductVariationInstance) => {
        const { flash_discount, discount, price } = variation;

        let finalPrice = price;
        if (flash_discount) {
          finalPrice = flash_discount.price;
        } else if (discount) {
          finalPrice = discount.price;
        }
        // @ts-ignore
        variation.setDataValue("final_price", finalPrice);
      });
    }
  });

  return Product;
}
