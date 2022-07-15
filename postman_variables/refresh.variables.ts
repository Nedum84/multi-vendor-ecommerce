import { Request, Response } from "express";
import { signin } from "./signin";
import productFake from "../src/ec-product/test.faker";
import productService from "../src/ec-product/service";
import categoryFake from "../src/ec-category/test.faker";
import categoryService from "../src/ec-category/service.category";
import collectionFake from "../src/ec-collection/test.faker";
import collectionService from "../src/ec-collection/service.collection";
import tagFake from "../src/ec-tag/test.faker";
import tagService from "../src/ec-tag/service.tag";
import tokenService from "../src/ec-auth/service.token";
import cartFake from "../src/ec-cart/test.faker";
import topupService from "../src/ec-topup/service";
import variationAttributesFake from "../src/ec-variation-attributes/variation.attributes.fake";
import userAddressFake from "../src/ec-user-address/test.faker";
import variationAttributesService from "../src/ec-variation-attributes/variation.attributes.service";
import ordersService from "../src/ec-orders/service";
import userAddressService from "../src/ec-user-address/service";
import wishlistService from "../src/ec-wishlist/service";
import vendorSettlementService from "../src/ec-vendor-settlement/service";
import withdrawalService from "../src/ec-withdrawal/service";
import { FlashSales, Orders, StoreOrders } from "../src/ec-models";
import { DeliveryStatus } from "../src/ec-orders/types";
import userService from "../src/ec-user/service";
import mediaService from "../src/ec-media/service";
import mediaFake from "../src/ec-media/test.faker";
import flashSalesService from "../src/ec-flash-sales/service";
import flashSalesFake from "../src/ec-flash-sales/test.faker";
import { SuccessResponse } from "../src/ec-api-response/success.response";
import config from "../src/ec-config/config";
import { generateChars } from "../src/ec-utils/random.string";
import fs from "fs";
import { pngFilePath } from "../src/ec-media/test";
import { generateNewCoupon } from "../src/ec-coupon/utils";
import { PaymentChannel } from "../src/ec-topup/types";

export const refreshVariables = async (req: Request, res: Response) => {
  //Reset DB
  // await sequelize.sync({ force: true });

  req.user = await signin(req);

  const variables = await processVariables(req);
  SuccessResponse.ok(res, variables);
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
  const {
    product_id: product_id2,
    variations: variations2,
    store_id: store_id2,
  } = await productService.create(req);

  req.body = flashSalesFake.create;
  await FlashSales.update({ revoke: true }, { where: {} }); //revoke all
  const { flash_sale_id } = await flashSalesService.createFlashSale(req);

  // Create produc attributes
  req.body = variationAttributesFake.create;
  const { attribute_id } = await variationAttributesService.createAttribute(req);
  const { attribute_id: attribute_id2 } = await variationAttributesService.createAttribute(req);

  const { attribute_set_id } = await variationAttributesFake.rawCreateAttributeSet({
    attribute_id,
  });

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
  await cartFake.rawCreate({ qty: 5, user_id, variation_id: variations1[0].variation_id });
  await cartFake.rawCreate({ qty: 8, user_id, variation_id: variations2[0].variation_id });
  // Create order
  req.body = { address_id };
  const { order_id, store_orders } = await ordersService.create(req);
  //update payment
  await Orders.update({ payment_completed: true }, { where: { order_id } });
  await StoreOrders.update(
    {
      delivered: true,
      delivered_at: new Date(Date.now() - 2 * 24 * 3600), //2 days ago
      delivery_status: DeliveryStatus.DELIVERED,
    },
    { where: { order_id } }
  );

  //Populate carts again(since the previous was cleared after order created)
  await cartFake.rawCreate({ qty: 5, user_id, variation_id: variations1[0].variation_id });
  await cartFake.rawCreate({ qty: 8, user_id, variation_id: variations2[0].variation_id });

  // Generate coupon code
  const coupon_code = await generateNewCoupon();

  // Top up wallet
  await topupService.topUserAccount({
    action_performed_by: user_id,
    user_id,
    amount: 12000,
    payment_channel: PaymentChannel.SQUAD,
    payment_reference: generateChars(43),
    transaction_fee: 0,
  });

  // Create wishlists
  req.body = { product_id };
  await wishlistService.create(req);
  req.body = { product_id: product_id2 };
  await wishlistService.create(req);

  // req.body = { product_id: product_id2 };
  const settlement = await vendorSettlementService.create(
    [store_orders[0].store_order_id],
    1200,
    store_id,
    undefined as any
  );
  // Withdraw some cool cash
  req.body = { amount: 200 };
  const { withdrawal_id } = await withdrawalService.withdraw(req);

  // Media create
  const fileBuffer = fs.readFileSync(pngFilePath);
  req.body.files = fileBuffer;
  const { file_id } = (await mediaService.createFiles(req))[0];
  const { file_id: file_id2 } = (await mediaService.createFiles(req))[0];

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
    store_order_id: store_orders[0].store_order_id,

    store_id,
    store_id2,
    category_id,
    collection_id,
    tag_id,

    coupon_code,

    settlement_id: settlement?.settlement_id,

    withdrawal_id,

    file_id,
    file_id2,
    folder_id,
  };
};
