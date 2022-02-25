import cartFake from "../factories/cart.fake";
import productVariationFake from "../factories/product.variation.fake";
import userAddressFake from "../factories/user.address.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

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
    const { body } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { sub_order_id } = body.data.order.sub_orders[0];

    const response = await request(`/sub-orders/${sub_order_id}`);

    expectSuccess(response);
    expect(response.body.data.sub_order.sub_order_id).toBe(sub_order_id);
  });

  it("Can find all suborders by order id", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    //Populate carts
    await cartFake.rawCreate({ qty: 5, store_id, user_id, variation_id });

    //create order
    const { body } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { order_id } = body.data.order;

    const response = await request(`/sub-orders/order/${order_id}`);

    expectSuccess(response);
    expect(response.body.data.sub_orders.length).toBeGreaterThan(0);
  });
});
