import { CREATED, OK } from "http-status";
import { generateChars } from "../ec-utils/random.string";
import couponFake from "./test.faker";
import { expectError, expectSuccess } from "../ec-test-utils/utils";
import productVariationFake from "../ec-product-variation/test.faker";
import cartFake from "../ec-cart/test.faker";
import storeFake from "../ec-store/test.faker";
import { customRequest } from "../ec-test-utils/custom.request";
import { applyCouponCap, calcCouponAmount, generateNewCoupon } from "./utils";
import { CouponAttributes } from "./model.coupon";

describe("Coupon Tests", () => {
  it("Can create coupon with product restriction", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.productRestriction();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.products.length).toBeGreaterThan(0);
  });
  it("Can create coupon with store restriction", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.storeRestriction();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.stores.length).toBeGreaterThan(0);
  });
  it("Can create coupon with user restriction", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.userRestriction();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.users.length).toBeGreaterThan(0);
  });

  it("Can create coupon with category restriction", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.categoryRestriction();
    const response = await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.coupon.categories.length).toBeGreaterThan(0);
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

    const payload = await couponFake.userRestriction();
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

  it("Can apply percentage discount coupon", async () => {
    const { user, tokens } = await global.signin();
    const { token } = tokens.access;
    const { user_id } = user;

    const variation1 = await productVariationFake.rawCreate();
    const { variation_id: variation_id1, product: product1 } = variation1;
    const variation2 = await productVariationFake.rawCreate();
    const { variation_id: variation_id2, product: product2 } = variation2;

    const { store_id: store_id1, categories: categories1 } = product1;
    const { store_id: store_id2, categories: categories2 } = product2;

    //Add some times to the cart
    const cart1 = await cartFake.rawCreate({ qty: 2, user_id, variation_id: variation_id1 });
    const cart2 = await cartFake.rawCreate({ qty: 40, user_id, variation_id: variation_id2 });

    //vary the length to avoid duplicate
    const stores_coupon_code = generateChars(20);
    const users_coupon_code = generateChars(21);
    const products_coupon_code = generateChars(22);
    const categories_coupon_code = generateChars(23);

    const stores = [{ store_id: store_id1 }, { store_id: store_id2 }];
    const users = [{ user_id }];
    const products = [{ product_id: product1.product_id }, { product_id: product2.product_id }];
    const categories = [
      { category_id: categories1[0].category_id },
      { category_id: categories2[0].category_id },
    ];
    //payloads
    const storesPayload = await couponFake.storeRestriction({ stores });
    const usersPayload = await couponFake.userRestriction({ users });
    const productsPayload = await couponFake.productRestriction({ products });
    const categoriesPayload = await couponFake.categoryRestriction({ categories });

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
    //apply categories  coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...categoriesPayload, coupon_code: categories_coupon_code },
    });
    const categoriesResponse = await customRequest({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code: categories_coupon_code },
      token,
    });

    expectSuccess(storesResponse);
    expectSuccess(usersResponse);
    expectSuccess(productsResponse);
    expectSuccess(categoriesResponse);

    const { coupon: stores_coupon } = storesResponse.body.data;
    const { coupon: users_coupon } = usersResponse.body.data;
    const { coupon: products_coupon } = productsResponse.body.data;
    const { coupon: categories_coupon } = categoriesResponse.body.data;

    // computes the 2 cart items coupon amount (since 2 items was added to the cart)
    const storesCouponAmount =
      calcCouponAmount(stores_coupon, cart1.qty, variation1) +
      calcCouponAmount(stores_coupon, cart2.qty, variation2);
    const usersCouponAmount =
      calcCouponAmount(users_coupon, cart1.qty, variation1) +
      calcCouponAmount(users_coupon, cart2.qty, variation2);
    const productsCouponAmount =
      calcCouponAmount(products_coupon, cart1.qty, variation1) +
      calcCouponAmount(products_coupon, cart2.qty, variation2);
    const categoriesCouponAmount =
      calcCouponAmount(categories_coupon, cart1.qty, variation1) +
      calcCouponAmount(categories_coupon, cart2.qty, variation2);

    // checking that the response {coupon_amount} matches the coupon amount computed using cart items
    // Also, we compare to be sure that { max_coupon_amount/fixed_coupon_amount } is applied if it's set
    expect(storesResponse.body.data.coupon_amount).toBe(
      applyCouponCap(stores_coupon, storesCouponAmount)
    );
    expect(usersResponse.body.data.coupon_amount).toBe(
      applyCouponCap(users_coupon, usersCouponAmount)
    );
    expect(productsResponse.body.data.coupon_amount).toBe(
      applyCouponCap(products_coupon, productsCouponAmount)
    );
    expect(categoriesResponse.body.data.coupon_amount).toBe(
      applyCouponCap(categories_coupon, categoriesCouponAmount)
    );

    // Checking for coupon amount without the cap applied
    expect(storesResponse.body.data.coupon_amount_without_cap).toBe(storesCouponAmount);
    expect(usersResponse.body.data.coupon_amount_without_cap).toBe(usersCouponAmount);
    expect(productsResponse.body.data.coupon_amount_without_cap).toBe(productsCouponAmount);
    expect(categoriesResponse.body.data.coupon_amount_without_cap).toBe(categoriesCouponAmount);
  });

  it("Can apply fixed amount coupon", async () => {
    const { user, tokens } = await global.signin();
    const { token } = tokens.access;
    const { user_id } = user;

    const variation1 = await productVariationFake.rawCreate();
    const { product: product1 } = variation1;
    const variation2 = await productVariationFake.rawCreate();
    const { product: product2 } = variation2;

    //Add some times to the cart
    await cartFake.rawCreate({ qty: 2, user_id, variation_id: variation1.variation_id });
    await cartFake.rawCreate({ qty: 40, user_id, variation_id: variation2.variation_id });

    // create coupon with store restriction
    const stores_coupon_code = generateChars(11);
    const stores = [{ store_id: product1.store_id }, { store_id: product2.store_id }];
    const storesPayload = await couponFake.storeRestriction({ stores });

    //create coupon
    await customRequest<CouponAttributes>({
      path: `/coupon`,
      method: "post",
      payload: { ...storesPayload, coupon_code: stores_coupon_code },
    });
    //apply coupon
    const response = await customRequest<CouponAttributes>({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code: stores_coupon_code },
      token,
    });

    expectSuccess(response);
  });

  it("Can check if coupon exist", async () => {
    const coupon_code1 = await generateNewCoupon();
    const coupon_code2 = await generateNewCoupon();
    const payload = await couponFake.productRestriction();

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

    const storesPayload = await couponFake.storeRestriction({ stores });
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

    const payload = await couponFake.categoryRestriction({ stores });
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
