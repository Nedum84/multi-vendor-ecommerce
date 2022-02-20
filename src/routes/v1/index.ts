import express from "express";
import authRoute from "./auth.route";
import cartRoute from "./cart.route";
import categoryRoute from "./category.route";
import collectionRoute from "./collection.route";
import couponRoute from "./coupon.route";
import mediaRoute from "./media.route";
import orderAddressRoute from "./order.address.route";
import ordersRoute from "./orders.route";
import productRoute from "./product.route";
import productVariationRoute from "./product.variation.route";
import storeRoute from "./store.route";
import subOrdersProductRoute from "./sub.orders.product.route";
import subOrdersRoute from "./sub.orders.route";
import userAddressRoute from "./user.address.route";
import userRoute from "./user.route";
import userWalletRoute from "./user.wallet.route";
import variationAttributesRoute from "./variation.attributes.route";
import vendorSettlementRoute from "./vendor.settlement.route";
import wishlistRoute from "./wishlist.route";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/cart", cartRoute);
router.use("/category", categoryRoute);
router.use("/collection", collectionRoute);
router.use("/coupon", couponRoute);
router.use("/media", mediaRoute);
router.use("/order-address", orderAddressRoute);

router.use("/orders", ordersRoute);
router.use("/product", productRoute);
router.use("/variation", productVariationRoute);
router.use("/store", storeRoute);
router.use("/sub-orders-products", subOrdersProductRoute);
router.use("/sub-orders", subOrdersRoute);
router.use("/user-address", userAddressRoute);
router.use("/user", userRoute);
router.use("/wallet", userWalletRoute);
router.use("/attributes", variationAttributesRoute);
router.use("/settlement", vendorSettlementRoute);
router.use("/wishlist", wishlistRoute);

export default router;
