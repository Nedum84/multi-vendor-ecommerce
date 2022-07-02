import { CartAttributes } from "./cart.model";
import cartFake from "./cart.fake";
import productVariationFake from "../ec-product-variation/product.variation.fake";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Cart Tests...", () => {
  it("Can  create cart", async () => {
    const { tokens } = await global.signin();
    const { variation_id } = await productVariationFake.rawCreate();

    const payload = { variation_id };
    const response = await customRequest({
      path: `/cart`,
      method: "post",
      payload,
      token: tokens.access.token,
    });

    expectSuccess(response);
  });

  it("Can update(add) item from cart", async () => {
    const { variation_id } = await productVariationFake.rawCreate();

    const { tokens } = await global.signin();

    //Add to cart
    await customRequest({
      path: `/cart`,
      method: "post",
      payload: { variation_id },
      token: tokens.access.token,
    });

    const payload = { variation_id, action: "add" };
    const response = await customRequest({
      path: `/cart`,
      method: "patch",
      payload,
      token: tokens.access.token,
    });
    const { carts }: { carts: CartAttributes[] } = response.body.data;
    const { qty } = carts.find((cart) => cart.variation_id === variation_id)!;

    expectSuccess(response);
    expect(qty).toBeGreaterThan(1);
  });
  it("Can update(remove) item from cart", async () => {
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { tokens, user } = await global.signin();
    const { token } = tokens.access;
    const { user_id } = user;

    const { store_id } = product;

    const CART_QTY = 3;
    //Populate carts
    await cartFake.rawCreate({ qty: CART_QTY, store_id: store_id, user_id, variation_id });

    const payload = { variation_id, action: "remove" };
    const response = await customRequest({
      path: `/cart`,
      method: "patch",
      payload,
      token,
    });

    const { carts }: { carts: CartAttributes[] } = response.body.data;
    const { qty } = carts.find((cart) => cart.variation_id === variation_id)!;

    expectSuccess(response);
    expect(qty).toBeLessThan(CART_QTY);
  });

  it("Can clear cart", async () => {
    const { variation_id } = await productVariationFake.rawCreate();

    const { tokens } = await global.signin();

    //Add to cart
    await customRequest({
      path: `/cart`,
      method: "post",
      payload: { variation_id },
      token: tokens.access.token,
    });

    const response = await customRequest({
      path: `/cart/clear`,
      method: "post",
      payload: { variation_id },
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.carts.length).toBe(0);
  });

  it("Can find all by user", async () => {
    const { variation_id } = await productVariationFake.rawCreate();

    const { tokens } = await global.signin();

    //Add to cart
    await customRequest({
      path: `/cart`,
      method: "post",
      payload: { variation_id },
      token: tokens.access.token,
    });

    const response = await customRequest({
      path: `/cart`,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.carts.length).not.toBe(0);
  });
});
