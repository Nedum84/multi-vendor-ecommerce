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
import { StoreOrdersFactory } from "./store.orders.model";
import { OrdersPaymentFactory } from "./orders.payment.model";
import { StoreOrdersProductFactory } from "./store.orders.product.model";
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
import { CreditCodeFactory } from "./credit.code.model";
import { CreditCodeUserFactory } from "./credit.code.user.model";
import { FlashSalesFactory } from "./flash.sales.model";
import { FlashSalesProductsFactory } from "./flash.sales.products.model";
import { RelatedProductFactory } from "./related.product.model";
import { TagFactory } from "./tag.model";
import { TagProductFactory } from "./tag.product.model";
import { WithdrawalFactory } from "./withdrawal.model";
import { ProductRatingFactory } from "./product.rating.model";
pg.defaults.parseInt8 = true; //Convert Int returned as strings to Int...

// @ts-ignore
const database = dbConfig[config.env] || dbConfig.development;
const sequelize = new Sequelize(database.database, database.username, database.password, {
  ...database,
  dialect: database.dialect,
  // timezone: "Europe/London", //Seems not to be working
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
export const CreditCode = CreditCodeFactory(sequelize);
export const CreditCodeUser = CreditCodeUserFactory(sequelize);
export const FlashSales = FlashSalesFactory(sequelize);
export const FlashSalesProducts = FlashSalesProductsFactory(sequelize);
export const MediaFiles = MediaFilesFactory(sequelize);
export const MediaFolder = MediaFolderFactory(sequelize);
export const OrdersAddress = OrdersAddressFactory(sequelize);
export const Orders = OrdersFactory(sequelize);
export const StoreOrders = StoreOrdersFactory(sequelize);
export const OrdersPayment = OrdersPaymentFactory(sequelize);
export const StoreOrdersProduct = StoreOrdersProductFactory(sequelize);
export const ProductAttribute = ProductAttributeFactory(sequelize);
export const ProductAttributeSets = ProductAttributeSetsFactory(sequelize);
export const ProductDiscount = ProductDiscountFactory(sequelize);
export const Product = ProductFactory(sequelize);
export const ProductRating = ProductRatingFactory(sequelize);
export const ProductVariation = ProductVariationFactory(sequelize);
export const ProductVariationWithAttributeSet = ProductVariationWithAttributeSetFactory(sequelize);
export const ProductWithAttribute = ProductWithAttributeFactory(sequelize);
export const RelatedProduct = RelatedProductFactory(sequelize);
export const Store = StoreFactory(sequelize);
export const Tag = TagFactory(sequelize);
export const TagProduct = TagProductFactory(sequelize);
export const Token = TokenFactory(sequelize);
export const VendorSettlement = VendorSettlementFactory(sequelize);
export const UserAddress = UserAddressFactory(sequelize);
export const User = UserFactory(sequelize);
export const UserWallet = UserWalletFactory(sequelize);
export const Wishlist = WishlistFactory(sequelize);
export const Withdrawal = WithdrawalFactory(sequelize);

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
  CreditCode,
  CreditCodeUser,
  FlashSales,
  FlashSalesProducts,
  MediaFiles,
  MediaFolder,
  OrdersAddress,
  Orders,
  StoreOrders,
  OrdersPayment,
  StoreOrdersProduct,
  ProductAttribute,
  ProductAttributeSets,
  ProductDiscount,
  Product,
  ProductRating,
  ProductVariation,
  ProductVariationWithAttributeSet,
  ProductWithAttribute,
  RelatedProduct,
  Store,
  Tag,
  TagProduct,
  Token,
  VendorSettlement,
  UserAddress,
  User,
  UserWallet,
  Wishlist,
  Withdrawal,
};

export type ModelRegistry = typeof models;

Object.values(models).forEach((model: any) => {
  if (isAssociatable<ModelRegistry>(model)) {
    model.associate(models);
  }
});

(async () => {
  // await sequelize.query(`ALTER USER ${database.username} SET timezone='Europe/London';`, {
  //   raw: true,
  //   type: QueryTypes.RAW,
  // });
  // await sequelize.sync({ force: true });
})();
export default sequelize;
