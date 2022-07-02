import cartFake from "../ec-cart/cart.fake";
import productVariationFake from "../ec-product-variation/product.variation.fake";
import userAddressFake from "../ec-user-address/user.address.fake";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Order Address Tests...", () => {
  it("Can find all order address", async () => {
    const { tokens, user } = await global.signin();
    const { address_id, email } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    //Populate carts
    await cartFake.rawCreate({ qty: 5, store_id, user_id, variation_id });

    //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const { order_id } = order;

    const response1 = await customRequest(`/order-address?order_id=${order_id}`);
    const response2 = await customRequest(`/order-address?email=${email}`);

    expectSuccess(response1);
    expectSuccess(response2);
    expect(response1.body.data.addresses.length).toBeGreaterThan(0);
    expect(response2.body.data.addresses.length).toBeGreaterThan(0);
  });
});
