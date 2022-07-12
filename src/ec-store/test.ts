import { CREATED } from "http-status";
import { Op } from "sequelize";
import { DeliveryStatus, OrderStatus } from "../ec-orders/types";
import { Orders, StoreOrders } from "../ec-models";
import tokenService from "../ec-auth/service.token";
import cartFake from "../ec-cart/test.faker";
import productVariationFake from "../ec-product-variation/test.faker";
import storeFake from "./test.faker";
import userAddressFake from "../ec-user-address/test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";
import { RETURNABLE_DAYS } from "../ec-orders/constants";

describe("User Tests...", () => {
  it("Can create a store", async () => {
    const { tokens, user } = await global.signin();

    const payload = storeFake.create;
    const response = await customRequest({ path: `/store`, method: "post", payload });

    expectSuccess(response, CREATED);
    expect(response.body.data.store.name).toBe(payload.name);
  });

  it("Can update store", async () => {
    const { tokens, user } = await global.signin();

    const { store_id } = await storeFake.rawCreate({
      user_id: user.user_id,
      verified: true,
      verified_at: new Date(),
    });
    const { access } = await tokenService.refreshToken(tokens.refresh.token);

    const payload = storeFake.update;
    const response = await customRequest({
      path: `/store/${store_id}`,
      method: "patch",
      payload,
      token: access.token,
    });

    expectSuccess(response);
    expect(response.body.data.store.name).toBe(payload.name);
  });

  it("Admin verify store", async () => {
    const { store_id } = await storeFake.rawCreate();

    const response = await customRequest({
      path: `/store/verify/${store_id}`,
      method: "patch",
    });

    expectSuccess(response);
    expect(response.body.data.store.verified).toBeTruthy();
  });

  it("Admin can update store", async () => {
    const { store_id } = await storeFake.rawCreate();

    const payload = storeFake.update;

    const response = await customRequest({
      path: `/store/admin-update/${store_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.store.email).toBe(payload.email);
  });
  it("Can find store by store id", async () => {
    const { store_id } = await storeFake.rawCreate();

    const response = await customRequest(`/store/${store_id}`);

    expectSuccess(response);
    expect(response.body.data.store.store_id).toBe(store_id);
  });
  it("Can find user stores", async () => {
    const { user } = await global.signin();
    const { user_id } = user;
    await storeFake.rawCreate({ user_id });
    await storeFake.rawCreate({ user_id });

    const response = await customRequest(`/store/user/stores?user_id=${user_id}`);

    expectSuccess(response);
    expect(response.body.data.stores.length).toBeGreaterThan(0);
  });

  it("Can find stores by query params", async () => {
    const { store_id, email, phone, name, verified } = await storeFake.rawCreate();

    const response1 = await customRequest(`/store?store_id=${store_id}`);
    const response2 = await customRequest(`/store?verified=${verified}`);
    const response3 = await customRequest(`/store?search_query=${email}`);
    const response4 = await customRequest(`/store?search_query=${phone}`);
    const response5 = await customRequest(`/store?search_query=${name}`);

    expectSuccess(response1);
    expectSuccess(response2);
    expectSuccess(response3);
    expectSuccess(response4);
    expectSuccess(response5);
    expect(response1.body.data.stores.length).toBeGreaterThan(0);
    expect(response2.body.data.stores.length).toBeGreaterThan(0);
    expect(response3.body.data.stores.length).toBeGreaterThan(0);
    expect(response4.body.data.stores.length).toBeGreaterThan(0);
    expect(response5.body.data.stores.length).toBeGreaterThan(0);
  });
  it("Can find store balance", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    // --> ORDER #1
    // Populate carts #1
    await cartFake.rawCreate({ qty: 3, user_id, variation_id });
    // create order
    const { body: body1 } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id: order_id1, store_orders: store_orders1 } = body1.data.order;
    const { store_order_id: store_order_id1 } = store_orders1[0];
    // --> ORDER #2
    // Populate carts #2
    await cartFake.rawCreate({ qty: 1, user_id, variation_id });
    // create order
    const { body: body2 } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id: order_id2, store_orders: store_orders2 } = body2.data.order;
    const { store_order_id: store_order_id2 } = store_orders2[0];
    // --> ORDER #3
    // Populate carts #3
    await cartFake.rawCreate({ qty: 2, user_id, variation_id });
    // create order
    const { body: body3 } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id: order_id3 } = body3.data.order;
    // --> ORDER #4
    // Populate carts #4
    await cartFake.rawCreate({ qty: 3, user_id, variation_id });
    // create order
    const { body: body4 } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id: order_id4 } = body4.data.order;

    // ORDER #1 & ORDER #2 are settled, ORDER #3 is unsettled
    //2days behind returnable days in milliseconds
    const datePast = Date.now() - (RETURNABLE_DAYS + 2) * 24 * 3600 * 1000;
    await Orders.update(
      { payment_completed: true },
      { where: { order_id: { [Op.or]: [order_id1, order_id2, order_id3] } } }
    );
    await StoreOrders.update(
      {
        delivered: true,
        delivered_at: new Date(datePast),
        delivery_status: DeliveryStatus.DELIVERED,
        order_status: OrderStatus.COMPLETED,
      },
      { where: { order_id: { [Op.or]: [order_id1, order_id2, order_id3] } } }
    );
    const { body } = await customRequest({
      path: `/orders/settlestore`,
      method: "post",
      payload: { store_order_ids: [store_order_id1, store_order_id2], store_id }, //only 1 & 2 are settled
    });

    // ORDER #4 is pending
    //2days ahead returnable days in milliseconds
    const datePresent = Date.now() - (RETURNABLE_DAYS - 2) * 24 * 3600 * 1000;
    await Orders.update({ payment_completed: true }, { where: { order_id: order_id4 } });
    await StoreOrders.update(
      {
        delivered: true,
        delivered_at: new Date(datePresent),
        delivery_status: DeliveryStatus.DELIVERED,
        order_status: OrderStatus.COMPLETED,
      },
      { where: { order_id: order_id4 } }
    );

    const response = await customRequest(`/store/balance/${store_id}`);
    expectSuccess(response);
    expect(response.body.data.total_earned).toBeGreaterThan(0);
    expect(response.body.data.total_pending).toBeGreaterThan(0);
    expect(response.body.data.total_pending).toBeGreaterThan(0);
  });
});
