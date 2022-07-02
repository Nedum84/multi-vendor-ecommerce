import { CREATED, OK } from "http-status";
import { generateChars } from "../ec-utils/random.string";
import couponFake from "./coupon.fake";
import { expectError, expectSuccess } from "../ec-test-utils/utils";
import productVariationFake from "../ec-product-variation/product.variation.fake";
import cartFake from "../ec-cart/cart.fake";
import storeFake from "../ec-store/store.fake";
import CouponUtils from "./coupon.utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Coupon Tests", () => {
  it("Can create product coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.productCreate();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.products.length).toBeGreaterThan(0);
  });
  it("Can create store coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.storeCreate();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.stores.length).toBeGreaterThan(0);
  });
  it("Can create user coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.userCreate();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.users.length).toBeGreaterThan(0);
  });

  it("Can create user & product coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.userProductCreate();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.products.length).toBeGreaterThan(0);
    expect(response.body.data.coupon.users.length).toBeGreaterThan(0);
  });

  it("Can create all orders coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.allOrdersCreate();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
  });

  it("Can generate coupon code", async () => {
    const response = await customRequest({
      path: `/coupon/generate`,
      method: "post",
    });

    expectSuccess(response, OK);
    expect(response.body.data.coupon).toBeDefined();
  });

  it("Can revoke coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.userCreate();
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    const response = await customRequest({
      path: `/coupon/revoke`,
      method: "post",
      payload: { coupon_code },
    });

    expectSuccess(response);
    expect(response.body.data.coupon.revoke).toBeTruthy();
  });

  it("Can apply coupon", async () => {
    const { user, tokens } = await global.signin();
    const { token } = tokens.access;
    const { user_id } = user;

    const {
      variation_id: variation_id1,
      product: product1,
      price: price1,
      discount: discount1,
      flash_discount: flash_discount1,
    } = await productVariationFake.rawCreate();
    const {
      variation_id: variation_id2,
      product: product2,
      price: price2,
      discount: discount2,
      flash_discount: flash_discount2,
    } = await productVariationFake.rawCreate();

    const { store_id: store_id1 } = product1;
    const { store_id: store_id2 } = product2;

    //Add to cart
    const cart1 = await cartFake.rawCreate({
      qty: 2,
      store_id: store_id1,
      user_id,
      variation_id: variation_id1,
    });
    const cart2 = await cartFake.rawCreate({
      qty: 40,
      store_id: store_id2,
      user_id,
      variation_id: variation_id2,
    });

    //vary the length to avoid duplicate
    const stores_coupon_code = generateChars(20);
    const users_coupon_code = generateChars(21);
    const products_coupon_code = generateChars(22);
    const user_products_coupon_code = generateChars(23);
    const all_orders_coupon_code = generateChars(24);

    const stores = [{ store_id: store_id1 }, { store_id: store_id2 }];
    const users = [{ user_id }];
    const products = [{ product_id: product1.product_id }, { product_id: product2.product_id }];
    //payloads
    const storesPayload = await couponFake.storeCreate({ stores });
    const usersPayload = await couponFake.userCreate({ users });
    const productsPayload = await couponFake.productCreate({ products });
    const userProductsPayload = await couponFake.userProductCreate({ users, products });
    const allOrdersPayload = await couponFake.allOrdersCreate({ users, products });

    //apply store coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...storesPayload, coupon_code: stores_coupon_code },
    });
    const storesResponse = await customRequest({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code: stores_coupon_code },
      token,
    });

    //apply user coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...usersPayload, coupon_code: users_coupon_code },
    });
    const usersResponse = await customRequest({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code: users_coupon_code },
      token,
    });

    //apply product coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...productsPayload, coupon_code: products_coupon_code },
    });
    const productsResponse = await customRequest({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code: products_coupon_code },
      token,
    });
    //apply user & product  coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...userProductsPayload, coupon_code: user_products_coupon_code },
    });
    const userProductsResponse = await customRequest({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code: user_products_coupon_code },
      token,
    });
    //apply user & product  coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...allOrdersPayload, coupon_code: all_orders_coupon_code },
    });
    const allOrdersResponse = await customRequest({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code: all_orders_coupon_code },
      token,
    });

    const { coupon: stores_coupon } = storesResponse.body.data;
    const { coupon: users_coupon } = usersResponse.body.data;
    const { coupon: products_coupon } = productsResponse.body.data;
    const { coupon: user_products_coupon } = userProductsResponse.body.data;
    const { coupon: all_orders_coupon } = allOrdersResponse.body.data;

    const storesCouponAmount =
      CouponUtils.calcCouponAmount(stores_coupon, cart1.qty, price1, discount1, flash_discount1) +
      CouponUtils.calcCouponAmount(stores_coupon, cart2.qty, price2, discount2, flash_discount2);
    const usersCouponAmount =
      CouponUtils.calcCouponAmount(users_coupon, cart1.qty, price1, discount1, flash_discount1) +
      CouponUtils.calcCouponAmount(users_coupon, cart2.qty, price2, discount2, flash_discount2);
    const productsCouponAmount =
      CouponUtils.calcCouponAmount(products_coupon, cart1.qty, price1, discount1, flash_discount1) +
      CouponUtils.calcCouponAmount(products_coupon, cart2.qty, price2, discount2, flash_discount2);
    const userProductsCouponAmount =
      CouponUtils.calcCouponAmount(
        user_products_coupon,
        cart1.qty,
        price1,
        discount1,
        flash_discount1
      ) +
      CouponUtils.calcCouponAmount(
        user_products_coupon,
        cart2.qty,
        price2,
        discount2,
        flash_discount2
      );
    const allOrdersCouponAmount =
      CouponUtils.calcCouponAmount(
        all_orders_coupon,
        cart1.qty,
        price1,
        discount1,
        flash_discount1
      ) +
      CouponUtils.calcCouponAmount(
        all_orders_coupon,
        cart2.qty,
        price2,
        discount2,
        flash_discount2
      );

    expectSuccess(storesResponse);
    expectSuccess(usersResponse);
    expectSuccess(productsResponse);
    expectSuccess(userProductsResponse);
    expectSuccess(allOrdersResponse);

    // Comparing to be sure that { max_coupon_amount } is applied if it's set
    expect(storesResponse.body.data.coupon_amount).toBe(
      CouponUtils.applyCouponCap(stores_coupon, storesCouponAmount)
    );
    expect(usersResponse.body.data.coupon_amount).toBe(
      CouponUtils.applyCouponCap(users_coupon, usersCouponAmount)
    );
    expect(productsResponse.body.data.coupon_amount).toBe(
      CouponUtils.applyCouponCap(products_coupon, productsCouponAmount)
    );
    expect(userProductsResponse.body.data.coupon_amount).toBe(
      CouponUtils.applyCouponCap(user_products_coupon, userProductsCouponAmount)
    );
    expect(allOrdersResponse.body.data.coupon_amount).toBe(
      CouponUtils.applyCouponCap(all_orders_coupon, allOrdersCouponAmount)
    );

    // Checking for coupon amount without the cap applied
    expect(storesResponse.body.data.coupon_amount_without_cap).toBe(storesCouponAmount);
    expect(usersResponse.body.data.coupon_amount_without_cap).toBe(usersCouponAmount);
    expect(productsResponse.body.data.coupon_amount_without_cap).toBe(productsCouponAmount);
    expect(userProductsResponse.body.data.coupon_amount_without_cap).toBe(userProductsCouponAmount);
    expect(allOrdersResponse.body.data.coupon_amount_without_cap).toBe(allOrdersCouponAmount);
  });

  it("Can check if coupon exist", async () => {
    const coupon_code1 = await CouponUtils.generateCoupon();
    const coupon_code2 = await CouponUtils.generateCoupon();
    const payload = await couponFake.allOrdersCreate();

    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code: coupon_code1 },
    });
    const notExistResponse = await customRequest({
      path: `/coupon/check-exist`,
      method: "post",
      payload: { coupon_code: coupon_code1 },
    });
    const couponExistResponse = await customRequest({
      path: `/coupon/check-exist`,
      method: "post",
      payload: { coupon_code: coupon_code2 },
    });

    expectSuccess(couponExistResponse);
    expectError(notExistResponse);
  });

  it("Can find coupon by coupon_code", async () => {
    const { coupon_code } = await couponFake.rawCreateProduct();

    const response = await customRequest(`/coupon/${coupon_code}`);
    expectSuccess(response);
    expect(response.body.data.coupon.coupon_code).toBe(coupon_code);
  });

  it("Can find all by store id", async () => {
    const { store_id: store_id1 } = await storeFake.rawCreate();
    const { store_id: store_id2 } = await storeFake.rawCreate();
    const coupon_code1 = generateChars(18);
    const coupon_code2 = generateChars(19);

    const stores = [{ store_id: store_id1 }, { store_id: store_id2 }];

    const storesPayload = await couponFake.storeCreate({ stores });
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...storesPayload, coupon_code: coupon_code1 },
    });
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...storesPayload, coupon_code: coupon_code2 },
    });

    const response = await customRequest(`/coupon/stores-coupon?store_id=${store_id1}`);
    const response2 = await customRequest(`/coupon/stores-coupon?store_id=${store_id1}`);

    expectSuccess(response);
    expect(response.body.data.coupons.length).not.toBe(0);

    expectSuccess(response2);
    expect(response2.body.data.coupons.length).not.toBe(0);
  });

  it("Can find all coupon", async () => {
    const { store_id: store_id1 } = await storeFake.rawCreate();
    const { store_id: store_id2 } = await storeFake.rawCreate();
    const coupon_code1 = generateChars(18);
    const coupon_code2 = generateChars(19);

    const stores = [{ store_id: store_id1 }, { store_id: store_id2 }];

    const payload = await couponFake.storeCreate({ stores });
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code: coupon_code1 },
    });
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code: coupon_code2 },
    });

    const response = await customRequest(
      `/coupon?store_id=${store_id1}&search_query=${payload.title}`
    );

    expectSuccess(response);
    expect(response.body.data.coupons.length).not.toBe(0);
  });
});
