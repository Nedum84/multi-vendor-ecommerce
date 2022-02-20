"use strict";
import { Sequelize } from "sequelize";
import dbConfig from "../database/config/db.config";
import config from "../config/config";
import pg from "pg";
import { isAssociatable } from "../typing/sequelize.association";
import { UserFactory } from "./user.model";
import { TokenFactory } from "./token.model";
import { CartFactory } from "./cart.model";
import { CouponProductFactory } from "./coupon.product.model";
import { CategoryFactory } from "./category.model";
import { CouponFactory } from "./coupon.model";
import { CouponStoreFactory } from "./coupon.store.model";
import { CouponUserFactory } from "./coupon.user.model";
import { MediaFilesFactory } from "./media.files.model";
import { MediaFolderFactory } from "./media.folder.model";
import { SubOrdersFactory } from "./sub.orders.model";
import { OrdersPaymentFactory } from "./orders.payment.model";
import { SubOrdersProductFactory } from "./sub.orders.product.model";
import { ProductAttributeFactory } from "./product.attribute.model";
import { ProductAttributeSetsFactory } from "./product.attribute.sets.model";
import { ProductDiscountFactory } from "./product.discount.model";
import { ProductFactory } from "./product.model";
import { ProductVariationFactory } from "./product.variation.model";
import { ProductVariationWithAttributeSetFactory } from "./product.variation.with.attribute.set.model";
import { ProductWithAttributeFactory } from "./product.with.attribute.model";
import { StoreFactory } from "./store.model";
import { VendorSettlementFactory } from "./vendor.settlement.model";
import { WishlistFactory } from "./wishlist.model";
import { OrdersAddressFactory } from "./orders.address.model";
import { UserAddressFactory } from "./user.address.model";
import { UserWalletFactory } from "./user.wallet.model";
import { OrdersFactory } from "./orders.model";
import { CollectionFactory } from "./collection.model";
import { CollectionProductFactory } from "./collection.product.model";
import { CategoryProductFactory } from "./category.product.model";
pg.defaults.parseInt8 = true; //Convert Int returned as strings to Int...

// @ts-ignore
const database = dbConfig[config.env] || dbConfig.development;
const sequelize = new Sequelize(database.dbname, database.username, database.password, {
  ...database,
  dialect: database.dialect,
});

export const Cart = CartFactory(sequelize);
export const Category = CategoryFactory(sequelize);
export const CategoryProduct = CategoryProductFactory(sequelize);
export const Collection = CollectionFactory(sequelize);
export const CollectionProduct = CollectionProductFactory(sequelize);
export const CouponProduct = CouponProductFactory(sequelize);
export const Coupon = CouponFactory(sequelize);
export const CouponStore = CouponStoreFactory(sequelize);
export const CouponUser = CouponUserFactory(sequelize);
export const MediaFiles = MediaFilesFactory(sequelize);
export const MediaFolder = MediaFolderFactory(sequelize);
export const OrdersAddress = OrdersAddressFactory(sequelize);
export const Orders = OrdersFactory(sequelize);
export const SubOrders = SubOrdersFactory(sequelize);
export const OrdersPayment = OrdersPaymentFactory(sequelize);
export const SubOrdersProduct = SubOrdersProductFactory(sequelize);
export const ProductAttribute = ProductAttributeFactory(sequelize);
export const ProductAttributeSets = ProductAttributeSetsFactory(sequelize);
export const ProductDiscount = ProductDiscountFactory(sequelize);
export const Product = ProductFactory(sequelize);
export const ProductVariation = ProductVariationFactory(sequelize);
export const ProductVariationWithAttributeSet = ProductVariationWithAttributeSetFactory(sequelize);
export const ProductWithAttribute = ProductWithAttributeFactory(sequelize);
export const Store = StoreFactory(sequelize);
export const Token = TokenFactory(sequelize);
export const VendorSettlement = VendorSettlementFactory(sequelize);
export const UserAddress = UserAddressFactory(sequelize);
export const User = UserFactory(sequelize);
export const UserWallet = UserWalletFactory(sequelize);
export const Wishlist = WishlistFactory(sequelize);

const models = {
  Cart,
  Category,
  CategoryProduct,
  Collection,
  CollectionProduct,
  CouponProduct,
  Coupon,
  CouponStore,
  CouponUser,
  MediaFiles,
  MediaFolder,
  OrdersAddress,
  Orders,
  SubOrders,
  OrdersPayment,
  SubOrdersProduct,
  ProductAttribute,
  ProductAttributeSets,
  ProductDiscount,
  Product,
  ProductVariation,
  ProductVariationWithAttributeSet,
  ProductWithAttribute,
  Store,
  Token,
  VendorSettlement,
  UserAddress,
  User,
  UserWallet,
  Wishlist,
};

export type ModelRegistry = typeof models;

Object.values(models).forEach((model: any) => {
  if (isAssociatable<ModelRegistry>(model)) {
    model.associate(models);
  }
});

(async () => {
  // await sequelize.sync({ force: true });
})();
export default sequelize;
