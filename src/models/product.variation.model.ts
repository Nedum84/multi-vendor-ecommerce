import moment from "moment";
import { Model, Optional, DataTypes, Sequelize, Op } from "sequelize";
import { ModelRegistry } from ".";
import { StockStatus } from "../enum/product.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { FlashSalesProductsInstance } from "./flash.sales.products.model";
import { ProductDiscountInstance } from "./product.discount.model";
import { ProductInstance } from "./product.model";
import { ProductVariationWithAttributeSetInstance } from "./product.variation.with.attribute.set.model";

export interface ProductVariationAttributes {
  variation_id: string;
  product_id: string;
  sku: string;
  price: number;
  with_storehouse_management: boolean; //true-> use qty, false-> use stock status
  stock_status: StockStatus;
  stock_qty: number;
  max_purchase_qty: number; //Max qty that can be purchase at a time
  is_default: boolean;
  weight: number; //in gram
  length: number; //in cm
  height: number; //in cm
  width: number; //in cm
}

// --> if (with_storehouse_management==true){manage...stock_qty } else {StockStatus}

interface ProductVariationCreationAttributes extends Optional<ProductVariationAttributes, "sku" | "variation_id"> {}

export interface ProductVariationInstance
  extends Model<ProductVariationAttributes, ProductVariationCreationAttributes>,
    ProductVariationAttributes {
  attribute_sets: ProductVariationWithAttributeSetInstance[];
  product: ProductInstance;
  discount: ProductDiscountInstance;
  flash_discount: FlashSalesProductsInstance;
}
//--> Model attributes
export const ProductVariationModelAttributes: SequelizeAttributes<ProductVariationAttributes> = {
  variation_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  with_storehouse_management: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  stock_status: {
    type: DataTypes.ENUM,
    values: Object.values(StockStatus),
    defaultValue: StockStatus.IN_STOCK,
  },
  stock_qty: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  max_purchase_qty: DataTypes.INTEGER,
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  weight: DataTypes.INTEGER,
  length: DataTypes.INTEGER,
  height: DataTypes.INTEGER,
  width: DataTypes.INTEGER,
};
export function ProductVariationFactory(sequelize: Sequelize) {
  const ProductVariation = <ModelStatic<ProductVariationInstance>>sequelize.define(
    "ProductVariation",
    ProductVariationModelAttributes as any,
    {
      timestamps: true,
      tableName: "ProductVariation",
      freezeTableName: true,
      paranoid: true,
      defaultScope: {},
      scopes: {
        basic: {},
      },
    }
  );

  ProductVariation.associate = function (models: ModelRegistry) {
    const { ProductVariation } = models;

    ProductVariation.belongsToMany(models.ProductAttributeSets, {
      as: "attribute_sets",
      through: models.ProductVariationWithAttributeSet,
      foreignKey: "variation_id",
      targetKey: "attribute_set_id",
    });

    ProductVariation.belongsTo(models.Product, {
      as: "product",
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    ProductVariation.hasOne(models.ProductDiscount, {
      as: "discount",
      foreignKey: "variation_id",
      sourceKey: "variation_id",
    });
    ProductVariation.hasOne(models.FlashSalesProducts, {
      as: "flash_discount",
      foreignKey: "variation_id",
      sourceKey: "variation_id",
    });
  };
  ProductVariation.prototype.toJSON = function () {
    const values = { ...this.get() };
    const exclude = ["version", "id"];
    exclude.forEach((e) => delete values[e]);
    return values;
  };
  return ProductVariation;
}
