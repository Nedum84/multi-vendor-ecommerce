import cartFake from "../ec-cart/cart.fake";
import productVariationFake from "../ec-product-variation/product.variation.fake";
import userAddressFake from "../ec-user-address/user.address.fake";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Sub Orders Tests...", () => {
  it("Can find Sub Order by sub_order ID", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
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
    const { store_order_id } = body.data.order.store_orders[0];

    const response = await customRequest(`/sub-orders/${store_order_id}`);

    expectSuccess(response);
    expect(response.body.data.sub_order.store_order_id).toBe(store_order_id);
  });

  it("Can find all StoreOrders by order id", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
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
    const { order_id } = body.data.order;

    const response = await customRequest(`/sub-orders/order/${order_id}`);

    expectSuccess(response);
    expect(response.body.data.store_orders.length).toBeGreaterThan(0);
  });
});
