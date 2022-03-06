import { Model, Optional, DataTypes, Sequelize } from "sequelize";
import { ModelRegistry } from ".";
import { ProductStatus } from "../enum/product.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { CollectionInstance } from "./collection.model";
import { ProductVariationInstance } from "./product.variation.model";

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
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "product_id"> {}

export interface ProductInstance extends Model<ProductAttributes, ProductCreationAttributes>, ProductAttributes {
  variations: ProductVariationInstance[];
  collections: CollectionInstance[];
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
};
export function ProductFactory(sequelize: Sequelize) {
  const Product = <ModelStatic<ProductInstance>>sequelize.define("Product", ProductModelAttributes as any, {
    timestamps: true,
    tableName: "Product",
    freezeTableName: true,
    paranoid: true,
    defaultScope: {},
    scopes: {
      basic: {
        attributes: ["title", "guarantee_period", "course_id"],
      },
    },
  });

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
    Product.belongsToMany(models.Category, {
      as: "categories",
      through: models.CategoryProduct,
      foreignKey: "product_id",
      targetKey: "category_id",
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
  return Product;
}
