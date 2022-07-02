import productFake from "../ec-product/product.fake";
import { customRequest } from "../ec-test-utils/custom.request";
import { expectSuccess } from "../ec-test-utils/utils";

describe("Wishlist Tests...", () => {
  it("Can create wishlist", async () => {
    const { tokens } = await global.signin();
    const { token } = tokens.access;

    const { product_id } = await productFake.rawCreate();

    const createResponse = await customRequest({
      path: `/wishlist`,
      method: "post",
      payload: { product_id },
      token,
    });

    const removeResponse = await customRequest({
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
    await customRequest({
      path: `/wishlist`,
      method: "post",
      payload: { product_id: product_id1 },
      token,
    });
    await customRequest({
      path: `/wishlist`,
      method: "post",
      payload: { product_id: product_id2 },
      token,
    });
    await customRequest({
      path: `/wishlist`,
      method: "post",
      payload: { product_id: product_id3 },
      token,
    });

    const response = await customRequest({ path: `/wishlist`, token });

    expectSuccess(response);
    expect(response.body.data.wishlists.length).toBe(3);
  });
});
