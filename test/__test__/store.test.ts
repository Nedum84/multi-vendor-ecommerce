import { CREATED } from "http-status";
import { Op } from "sequelize/dist";
import { DeliveryStatus, OrderStatus } from "../../src/enum/orders.enum";
import { Orders, SubOrders } from "../../src/models";
import tokenService from "../../src/services/token.service";
import CONSTANTS from "../../src/utils/constants";
import cartFake from "../factories/cart.fake";
import productVariationFake from "../factories/product.variation.fake";
import storeFake from "../factories/store.fake";
import userAddressFake from "../factories/user.address.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("User Tests...", () => {
  it("Can create a store", async () => {
    const { tokens, user } = await global.signin();

    const payload = storeFake.create;
    const response = await request({ path: `/store`, method: "post", payload });

    expectSuccess(response, CREATED);
    expect(response.body.data.store.name).toBe(payload.name);
  });

  it("Can update store", async () => {
    const { tokens, user } = await global.signin();

    const { store_id } = await storeFake.rawCreate({ user_id: user.user_id, verified: true, verified_at: new Date() });
    const { access } = await tokenService.refreshToken(tokens.refresh.token);

    const payload = storeFake.update;
    const response = await request({
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

    const response = await request({
      path: `/store/verify/${store_id}`,
      method: "patch",
    });

    expectSuccess(response);
    expect(response.body.data.store.verified).toBeTruthy();
  });

  it("Admin can update store", async () => {
    const { store_id } = await storeFake.rawCreate();

    const payload = storeFake.update;

    const response = await request({
      path: `/store/admin-update/${store_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.store.email).toBe(payload.email);
  });
  it("Can find store by store id", async () => {
    const { store_id } = await storeFake.rawCreate();

    const response = await request(`/store/${store_id}`);

    expectSuccess(response);
    expect(response.body.data.store.store_id).toBe(store_id);
  });
  it("Can find user stores", async () => {
    const { user } = await global.signin();
    const { user_id } = user;
    await storeFake.rawCreate({ user_id });
    await storeFake.rawCreate({ user_id });

    const response = await request(`/store/user/stores?user_id=${user_id}`);

    expectSuccess(response);
    expect(response.body.data.stores.length).toBeGreaterThan(0);
  });

  it("Can find stores by query params", async () => {
    const { store_id, email, phone, name, verified } = await storeFake.rawCreate();

    const response1 = await request(`/store?store_id=${store_id}`);
    const response2 = await request(`/store?verified=${verified}`);
    const response3 = await request(`/store?search_query=${email}`);
    const response4 = await request(`/store?search_query=${phone}`);
    const response5 = await request(`/store?search_query=${name}`);

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
    await cartFake.rawCreate({ qty: 3, store_id, user_id, variation_id });
    // create order
    const { body: body1 } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { order_id: order_id1, sub_orders: sub_orders1 } = body1.data.order;
    const { sub_order_id: sub_order_id1 } = sub_orders1[0];
    // --> ORDER #2
    // Populate carts #2
    await cartFake.rawCreate({ qty: 1, store_id, user_id, variation_id });
    // create order
    const { body: body2 } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { order_id: order_id2, sub_orders: sub_orders2 } = body2.data.order;
    const { sub_order_id: sub_order_id2 } = sub_orders2[0];
    // --> ORDER #3
    // Populate carts #3
    await cartFake.rawCreate({ qty: 2, store_id, user_id, variation_id });
    // create order
    const { body: body3 } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { order_id: order_id3 } = body3.data.order;
    // --> ORDER #4
    // Populate carts #4
    await cartFake.rawCreate({ qty: 3, store_id, user_id, variation_id });
    // create order
    const { body: body4 } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { order_id: order_id4 } = body4.data.order;

    // ORDER #1 & ORDER #2 are settled, ORDER #3 is unsettled
    //2days behind returnable days in milliseconds
    const datePast = Date.now() - (CONSTANTS.RETURNABLE_DAYS + 2) * 24 * 3600 * 1000;
    await Orders.update(
      { payment_completed: true },
      { where: { order_id: { [Op.or]: [order_id1, order_id2, order_id3] } } }
    );
    await SubOrders.update(
      {
        delivered: true,
        delivered_at: new Date(datePast),
        delivery_status: DeliveryStatus.DELIVERED,
        order_status: OrderStatus.COMPLETED,
      },
      { where: { order_id: { [Op.or]: [order_id1, order_id2, order_id3] } } }
    );
    const { body } = await request({
      path: `/orders/settlestore`,
      method: "post",
      payload: { sub_order_ids: [sub_order_id1, sub_order_id2], store_id }, //only 1 & 2 are settled
    });

    // ORDER #4 is pending
    //2days ahead returnable days in milliseconds
    const datePresent = Date.now() - (CONSTANTS.RETURNABLE_DAYS - 2) * 24 * 3600 * 1000;
    await Orders.update({ payment_completed: true }, { where: { order_id: order_id4 } });
    await SubOrders.update(
      {
        delivered: true,
        delivered_at: new Date(datePresent),
        delivery_status: DeliveryStatus.DELIVERED,
        order_status: OrderStatus.COMPLETED,
      },
      { where: { order_id: order_id4 } }
    );

    const response = await request(`/store/balance/${store_id}`);
    expectSuccess(response);
    expect(response.body.data.total_earned).toBeGreaterThan(0);
    expect(response.body.data.total_pending).toBeGreaterThan(0);
    expect(response.body.data.total_pending).toBeGreaterThan(0);
  });
});
