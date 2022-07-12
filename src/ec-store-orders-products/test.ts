import cartFake from "../ec-cart/test.faker";
import productVariationFake from "../ec-product-variation/test.faker";
import userAddressFake from "../ec-user-address/test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Sub Order Products Tests...", () => {
  it("Can find all Sub Order products by sub_order ID", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });

    //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });

    const { store_order_id } = body.data.order.store_orders[0];

    const response = await customRequest(`/sub-orders-products/${store_order_id}`);

    expectSuccess(response);
    expect(response.body.data.order_products.length).toBeGreaterThan(0);
  });
});
