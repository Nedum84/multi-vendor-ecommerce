import { Request, Response } from "express";
import { signin } from "./utils/signin";
import productFake from "../test/factories/product.fake";
import productService from "../src/services/product.service";
import categoryFake from "../test/factories/category.fake";
import categoryService from "../src/services/category.service";
import collectionFake from "../test/factories/collection.fake";
import collectionService from "../src/services/collection.service";
import tagFake from "../test/factories/tag.fake";
import tagService from "../src/services/tag.service";
import tokenService from "../src/services/token.service";
import cartFake from "../test/factories/cart.fake";
import CouponUtils from "../src/utils/coupon.utils";
import CreditCodeUtils from "../src/utils/credit.utils";
import { generateChars } from "../src/utils/random.string";
import { PaymentChannel } from "../src/enum/payment.enum";
import userWalletService from "../src/services/user.wallet.service";
import variationAttributesFake from "../test/factories/variation.attributes.fake";
import userAddressFake from "../test/factories/user.address.fake";
import variationAttributesService from "../src/services/variation.attributes.service";
import ordersService from "../src/services/orders.service";
import userAddressService from "../src/services/user.address.service";
import wishlistService from "../src/services/wishlist.service";
import vendorSettlementService from "../src/services/vendor.settlement.service";
import withdrawalService from "../src/services/withdrawal.service";
import sequelize, { FlashSales, Orders, SubOrders } from "../src/models";
import { DeliveryStatus } from "../src/enum/orders.enum";
import userService from "../src/services/user.service";
import mediaService from "../src/services/media.service";
import mediaFake from "../test/factories/media.fake";
import flashSalesService from "../src/services/flash.sales.service";
import flashSalesFake from "../test/factories/flash.sales.fake";
import { ApiResponse } from "../src/apiresponse/api.response";
import config from "../src/config/config";

export const allVariables = async (req: Request, res: Response) => {
  //Reset DB
  // await sequelize.sync({ force: true });

  req.user = await signin(req);

  const variables = await processVariables(req);
  ApiResponse.ok(res, variables);
};

const processVariables = async (req: Request) => {
  const { user_id } = req.user!;
  const user = await userService.findById(user_id);
  // Extend jwt token for postman session
  config.jwt.accessExpires = `${60 * 24 * 60}`; // 60days X 24hrs X 60mins
  const { access } = await tokenService.generateAuthTokens(user as any, []);
  // Reset token back to the initial
  config.jwt.accessExpires = process.env.JWT_ACCESS_EXPIRATION_MINUTES;

  //Create product/variations
  req.body = await productFake.create();
  const { product_id, variations: variations1, store_id } = await productService.create(req);
  const { product_id: product_id2, variations: variations2, store_id: store_id2 } = await productService.create(req);

  req.body = flashSalesFake.create;
  await FlashSales.update({ revoke: true }, { where: {} }); //revoke all
  const { flash_sale_id } = await flashSalesService.createFlashSale(req);

  // Create produc attributes
  req.body = variationAttributesFake.create;
  const { attribute_id } = await variationAttributesService.createAttribute(req);
  const { attribute_id: attribute_id2 } = await variationAttributesService.createAttribute(req);

  const { attribute_set_id } = await variationAttributesFake.rawCreateAttributeSet({ attribute_id });

  // Create category
  req.body = categoryFake.create;
  const { category_id } = await categoryService.create(req);

  //Create collection
  req.body = collectionFake.create;
  const { collection_id } = await collectionService.create(req);

  // Create tags
  req.body = tagFake.create;
  const { tag_id } = await tagService.create(req);

  // Create user address
  req.body = userAddressFake.create;
  const { address_id } = await userAddressService.create(req);

  //Populate carts
  await cartFake.rawCreate({ qty: 5, store_id: store_id, user_id, variation_id: variations1[0].variation_id });
  await cartFake.rawCreate({ qty: 8, store_id: store_id2, user_id, variation_id: variations2[0].variation_id });
  // Create order
  req.body = { address_id };
  const { order_id, sub_orders } = await ordersService.create(req);
  //update payment
  await Orders.update({ payment_completed: true }, { where: { order_id } });
  await SubOrders.update(
    {
      delivered: true,
      delivered_at: new Date(Date.now() - 2 * 24 * 3600), //2 days ago
      delivery_status: DeliveryStatus.DELIVERED,
    },
    { where: { order_id } }
  );

  //Populate carts again(since the previous was cleared after order created)
  await cartFake.rawCreate({ qty: 5, store_id: store_id, user_id, variation_id: variations1[0].variation_id });
  await cartFake.rawCreate({ qty: 8, store_id: store_id2, user_id, variation_id: variations2[0].variation_id });

  //Generate codes
  const coupon_code = await CouponUtils.generateCoupon();
  const credit_code = await CreditCodeUtils.generateCreditCode();

  //Top up credit
  req.body = {
    payment_reference: generateChars(43),
    amount: 12000,
    channel: PaymentChannel.SQUAD,
  };
  await userWalletService.userCreateCreditReward(req);

  // Create wishlists
  req.body = { product_id };
  await wishlistService.create(req);
  req.body = { product_id: product_id2 };
  await wishlistService.create(req);

  // req.body = { product_id: product_id2 };
  const settlement = await vendorSettlementService.create(
    [sub_orders[0].sub_order_id],
    1200,
    store_id,
    undefined as any
  );
  // Withdraw some cool cash
  req.body = { amount: 200 };
  const { withdrawal_id } = await withdrawalService.withdraw(req);

  // Media create
  req.body = mediaFake.createFile();
  const { file_id } = await mediaService.createFile(req);
  const { file_id: file_id2 } = await mediaService.createFile(req);

  req.body = mediaFake.createFolder();
  const { folder_id } = await mediaService.createFolder(req);

  return {
    user_id,
    token: access.token,

    product_id,
    product_id2,

    variation_id: variations1[0].variation_id,
    variation_id2: variations2[0].variation_id,

    flash_sale_id,

    attribute_id,
    attribute_id2,
    attribute_set_id,

    address_id,
    order_id,
    sub_order_id: sub_orders[0].sub_order_id,

    store_id,
    store_id2,
    category_id,
    collection_id,
    tag_id,

    coupon_code,
    credit_code,

    settlement_id: settlement?.settlement_id,

    withdrawal_id,

    file_id,
    file_id2,
    folder_id,
  };
};
