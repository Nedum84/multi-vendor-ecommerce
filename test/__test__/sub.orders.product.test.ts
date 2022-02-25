import cartFake from "../factories/cart.fake";
import productVariationFake from "../factories/product.variation.fake";
import userAddressFake from "../factories/user.address.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Sub Order Products Tests...", () => {
  it("Can find all Sub Order products by sub_order ID", async () => {
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

    const response = await request(`/sub-orders-products/${sub_order_id}`);

    expectSuccess(response);
    expect(response.body.data.order_products.length).toBeGreaterThan(0);
  });
});
