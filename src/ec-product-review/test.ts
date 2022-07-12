import { CREATED } from "http-status";
import { DeliveryStatus } from "../ec-orders/types";
import { Orders, StoreOrders } from "../ec-models";
import cartFake from "../ec-cart/test.faker";
import productVariationFake from "../ec-product-variation/test.faker";
import userAddressFake from "../ec-user-address/test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Product Rating Tests...", () => {
  let productId: string;
  let storeId: string;
  let userToken: string;

  it("Can rate a product", async () => {
    const { user, tokens } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    productId = product_id;
    userToken = token;
    storeId = store_id;

    //--> purchase product
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id } = body.data.order;
    //update payment
    await Orders.update({ payment_completed: true }, { where: { order_id } });
    await StoreOrders.update(
      {
        delivered: true,
        delivered_at: new Date(Date.now() - 2 * 24 * 3600), //2 days ago
        delivery_status: DeliveryStatus.DELIVERED,
      },
      { where: { order_id } }
    );

    //Rate Product
    const rating = 4;
    const response = await customRequest({
      path: `/product-rating`,
      method: "post",
      payload: { product_id, rating, message: "Any random message" },
      token,
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.rating.rating).toBe(rating);
  });

  it("Can update rating", async () => {
    const rating = 3;

    const response = await customRequest({
      path: `/product-rating`,
      method: "patch",
      payload: { product_id: productId, rating, message: "Any random message" },
      token: userToken,
    });

    expectSuccess(response);
    expect(response.body.data.rating.rating).toBe(rating);
  });

  it("Can check if i have rated a product", async () => {
    const response = await customRequest({
      path: `/product-rating/check/${productId}`,
      token: userToken,
    });

    expectSuccess(response);
    expect(response.body.data.rating.rating).toBeDefined();
  });

  it("Can find all product ratings", async () => {
    const response = await customRequest(`/product-rating/product/${productId}`);

    expectSuccess(response);
    expect(response.body.data.ratings.length).not.toBe(0);
  });
  it("Can find all store ratings", async () => {
    const response = await customRequest(`/product-rating/store/${storeId}`);

    expectSuccess(response);
    expect(response.body.data.ratings.length).not.toBe(0);
  });
});
