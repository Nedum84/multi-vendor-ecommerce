import productFake from "../factories/product.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Wishlist Tests...", () => {
  it("Can create wishlist", async () => {
    const { tokens } = await global.signin();
    const { token } = tokens.access;

    const { product_id } = await productFake.rawCreate();

    const createResponse = await request({
      path: `/wishlist`,
      method: "post",
      payload: { product_id },
      token,
    });

    const removeResponse = await request({
      path: `/wishlist`,
      method: "post",
      payload: { product_id },
      token,
    });

    expectSuccess(createResponse);
    expectSuccess(removeResponse);
    expect(createResponse.body.data.wishlist.product_id).toBe(product_id);
    expect(removeResponse.body.data.wishlist).toBeNull();
  });

  it("Can find all by user id", async () => {
    const { tokens } = await global.signin();
    const { token } = tokens.access;
    const { product_id: product_id1 } = await productFake.rawCreate();
    const { product_id: product_id2 } = await productFake.rawCreate();
    const { product_id: product_id3 } = await productFake.rawCreate();

    //Populate wishlists
    await request({ path: `/wishlist`, method: "post", payload: { product_id: product_id1 }, token });
    await request({ path: `/wishlist`, method: "post", payload: { product_id: product_id2 }, token });
    await request({ path: `/wishlist`, method: "post", payload: { product_id: product_id3 }, token });

    const response = await request({ path: `/wishlist`, token });

    expectSuccess(response);
    expect(response.body.data.wishlists.length).toBe(3);
  });
});
