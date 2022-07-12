"use strict";
import { Sequelize } from "sequelize";
import dbConfig from "../database/config/db.config";
import config from "../ec-config/config";
import pg from "pg";
import { UserFactory } from "../ec-user/user.model";
import { TokenFactory } from "../ec-auth/token.model";
import { CartFactory } from "../ec-cart/cart.model";
import { CouponProductFactory } from "../ec-coupon/model.product";
import { CategoryFactory } from "../ec-category/category.model";
import { CouponFactory } from "../ec-coupon/model.coupon";
import { CouponStoreFactory } from "../ec-coupon/model.store";
import { CouponUserFactory } from "../ec-coupon/model.user";
import { MediaFilesFactory } from "../ec-media/model.media.files";
import { MediaFolderFactory } from "../ec-media/model.media.folder";
import { StoreOrdersFactory } from "../ec-store-orders/store.orders.model";
import { OrdersPaymentFactory } from "../ec-orders/orders.payment.model";
import { StoreOrdersProductFactory } from "../ec-store-orders-products/store.orders.product.model";
import { ProductAttributeFactory } from "../ec-variation-attributes/product.attribute.model";
import { ProductAttributeSetsFactory } from "../ec-variation-attributes/product.attribute.sets.model";
import { ProductDiscountFactory } from "../ec-product-variation/product.discount.model";
import { ProductFactory } from "../ec-product/product.model";
import { ProductVariationFactory } from "../ec-product-variation/product.variation.model";
import { ProductVariationWithAttributeSetFactory } from "../ec-variation-attributes/product.variation.with.attribute.set.model";
import { ProductWithAttributeFactory } from "../ec-variation-attributes/product.with.attribute.model";
import { StoreFactory } from "../ec-store/store.model";
import { VendorSettlementFactory } from "../ec-vendor-settlement/vendor.settlement.model";
import { WishlistFactory } from "../ec-wishlist/wishlist.model";
import { OrdersAddressFactory } from "../ec-orders-address/orders.address.model";
import { UserAddressFactory } from "../ec-user-address/user.address.model";
import { UserWalletFactory } from "../ec-user-wallet/user.wallet.model";
import { OrdersFactory } from "../ec-orders/orders.model";
import { CollectionFactory } from "../ec-collection/collection.model";
import { CollectionProductFactory } from "../ec-collection/collection.product.model";
import { CategoryProductFactory } from "../ec-category/category.product.model";
import { CreditCodeFactory } from "../ec-credit-code/credit.code.model";
import { CreditCodeUserFactory } from "../ec-credit-code/credit.code.user.model";
import { FlashSalesFactory } from "../ec-flash-sales/flash.sales.model";
import { FlashSalesProductsFactory } from "../ec-flash-sales/flash.sales.products.model";
import { RelatedProductFactory } from "../ec-related-product/related.product.model";
import { TagFactory } from "../ec-tag/tag.model";
import { TagProductFactory } from "../ec-tag/tag.product.model";
import { WithdrawalFactory } from "../ec-withdrawal/withdrawal.model";
import { ProductRatingFactory } from "../ec-product-review/product.rating.model";
import { isAssociatable } from "./types";
import { CouponCategoryFactory } from "../ec-coupon/model.category";
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
export const CouponCategory = CouponCategoryFactory(sequelize);
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
  CouponCategory,
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
export type ModelRegistryKeys = keyof typeof models;

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
