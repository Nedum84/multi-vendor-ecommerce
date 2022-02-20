import { CREATED, OK } from "http-status";
import { generateChars } from "../../src/utils/random.string";
import cartFake from "../factories/cart.fake";
import couponFake from "../factories/coupon.fake";
import productVariationFake from "../factories/product.variation.fake";
import storeFake from "../factories/store.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Coupon Tests", () => {
  it("Can create product coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.productCreate();
    const response = await request({
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
    const response = await request({
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
    const response = await request({
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
    const response = await request({
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
    const response = await request({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    expectSuccess(response, CREATED);
  });
  it("Can generate coupon code", async () => {
    const response = await request({
      path: `/coupon/generate`,
      method: "post",
    });

    expectSuccess(response, OK);
    expect(response.body.data.coupon).toBeDefined();
  });
  it("Can revoke coupon", async () => {
    const coupon_code = generateChars();

    const payload = await couponFake.userCreate();
    await request({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    const response = await request({
      path: `/coupon/revoke`,
      method: "post",
      payload: { coupon_code },
    });

    expectSuccess(response);
    expect(response.body.data.coupon.revoke).toBeTruthy();
  });

  it("Can apply store coupon", async () => {
    const { store_id: store_id1 } = await storeFake.rawCreate();
    const { store_id: store_id2 } = await storeFake.rawCreate();
    const { variation_id: variation_id1, price: price1, discount: discount1 } = await productVariationFake.rawCreate();
    const { variation_id: variation_id2, price: price2, discount: discount2 } = await productVariationFake.rawCreate();
    const { user, tokens } = await global.signin();

    //Add to cart
    const cart1 = await cartFake.rawCreate({
      qty: 2,
      store_id: store_id1,
      user_id: user.user_id,
      variation_id: variation_id1,
    });
    const cart2 = await cartFake.rawCreate({
      qty: 2,
      store_id: store_id2,
      user_id: user.user_id,
      variation_id: variation_id2,
    });

    //Generatec coupon
    const coupon_code = generateChars();

    const stores = [{ store_id: store_id1 }, { store_id: store_id2 }];
    const payload = await couponFake.storeCreate({ stores });
    await request({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    // const response = await request({
    //   path: `/coupon/apply`,
    //   method: "post",
    //   payload: { coupon_code },
    //   token: tokens.access.token,
    // });

    // const { percentage_discount } = response.body.data.coupon;
    // const couponPercent = percentage_discount / 100;

    // let couponAmount = 0;
    // if (discount1) {
    //   couponAmount += cart1.qty * discount1.price * couponPercent;
    // } else {
    //   couponAmount += cart1.qty * price1 * couponPercent;
    // }
    // if (discount2) {
    //   couponAmount += cart2.qty * discount2.price * couponPercent;
    // } else {
    //   couponAmount += cart2.qty * price2 * couponPercent;
    // }

    // expectSuccess(response);
    // expect(response.body.data.coupon_amount).toBe(couponAmount);
  });

  it("Can apply user coupon", async () => {
    const { store_id: store_id1 } = await storeFake.rawCreate();
    const { store_id: store_id2 } = await storeFake.rawCreate();
    const {
      variation_id: variation_id1,
      price: price1,
      discount: discount1,
    } = await productVariationFake.rawCreate({ discount: null });
    const {
      variation_id: variation_id2,
      price: price2,
      discount: discount2,
    } = await productVariationFake.rawCreate({ discount: null });
    const { user, tokens } = await global.signin();

    //Add to cart
    const cart1 = await cartFake.rawCreate({
      qty: 2,
      store_id: store_id1,
      user_id: user.user_id,
      variation_id: variation_id1,
    });
    const cart2 = await cartFake.rawCreate({
      qty: 2,
      store_id: store_id2,
      user_id: user.user_id,
      variation_id: variation_id2,
    });

    //Generatec coupon
    const coupon_code = generateChars();

    const users = [{ user_id: user.user_id }];
    const payload = await couponFake.userCreate({ users });
    await request({
      path: `/coupon`,
      method: "post",
      payload: { ...payload, coupon_code },
    });

    const response = await request({
      path: `/coupon/apply`,
      method: "post",
      payload: { coupon_code },
      token: tokens.access.token,
    });

    const { percentage_discount } = response.body.data.coupon;
    const couponPercent = percentage_discount / 100;

    let couponAmount = 0;
    if (discount1) {
      couponAmount += cart1.qty * discount1.price * couponPercent;
    } else {
      couponAmount += cart1.qty * price1 * couponPercent;
    }
    if (discount2) {
      couponAmount += cart2.qty * discount2.price * couponPercent;
    } else {
      couponAmount += cart2.qty * price2 * couponPercent;
    }

    console.log(couponAmount, response.body);

    expectSuccess(response);
    expect(response.body.data.coupon_amount).toBe(couponAmount);
  });

  it("Can apply product coupon", async () => {
    const { store_id: store_id1 } = await storeFake.rawCreate();
    const { store_id: store_id2 } = await storeFake.rawCreate();
    const { variation_id: variation_id1, discount, price } = await productVariationFake.rawCreate({ discount: null });
    const { variation_id: variation_id2 } = await productVariationFake.rawCreate();
    const { user, tokens } = await global.signin();

    console.log(discount, "====");

    //Add to cart
    await cartFake.rawCreate({
      qty: 2,
      store_id: store_id1,
      user_id: user.user_id,
      variation_id: variation_id1,
    });
    await cartFake.rawCreate({
      qty: 2,
      store_id: store_id2,
      user_id: user.user_id,
      variation_id: variation_id2,
    });

    //Generatec coupon
    // const coupon_code = generateChars();

    // const stores = [{ store_id: store_id1 }, { store_id: store_id2 }];
    // const payload = await couponFake.storeCreate({ stores });
    // await request({
    //   path: `/coupon`,
    //   method: "post",
    //   payload: { ...payload, coupon_code },
    // });

    // const response = await request({
    //   path: `/coupon/apply`,
    //   method: "post",
    //   payload: { coupon_code },
    //   token: tokens.access.token,
    // });
    // console.log(coupon_code, user.user_id, response.body);

    // expectSuccess(response);
    // expect(response.body.data.author.name).toBe("updated");
    // expect(response.body.data.author.name).toBe(authorsFake.update.name);
  });

  it("Can get an author by id", async () => {
    // const { author_id } = await authorsFake.rawCreate();
    // const response = await request(`/coupon/${author_id}`);
    // expectSuccess(response);
    // expect(response.body.data.author.name).not.toBeNull();
  });

  it("Can find all", async () => {
    // const response = await request(`/coupon?limit=12`);
    // expectSuccess(response);
    // expect(response.body.data.author.length).not.toBe(0);
  });
});
