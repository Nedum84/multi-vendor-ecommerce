import { Op } from "sequelize";
import { DeliveryStatus, OrderStatus } from "../ec-orders/types";
import { Orders, StoreOrders, VendorSettlement } from "../ec-models";
import { VendorSettlementInstance } from "./vendor.settlement.model";
import CONSTANTS from "../ec-utils/constants";
import cartFake from "../ec-cart/cart.fake";
import productVariationFake from "../ec-product-variation/product.variation.fake";
import storeFake from "../ec-store/store.fake";
import userAddressFake from "../ec-user-address/user.address.fake";
import { expectSuccess } from "../ec-test-utils/utils";
import { createModel } from "../ec-models/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Vendor Settlements...", () => {
  it("Can settlements by store id &/or settlement id", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    // --> ORDER #1
    // Populate carts #1
    await cartFake.rawCreate({ qty: 5, store_id, user_id, variation_id });
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
    await cartFake.rawCreate({ qty: 3, store_id, user_id, variation_id });
    // create order
    const { body: body2 } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id: order_id2, store_orders: store_orders2 } = body2.data.order;
    const { store_order_id: store_order_id2 } = store_orders2[0];
    //2days behind returnable days in milliseconds
    const datePast = Date.now() - (CONSTANTS.RETURNABLE_DAYS + 2) * 24 * 3600 * 1000;
    await Orders.update(
      { payment_completed: true },
      { where: { order_id: { [Op.or]: [order_id1, order_id2] } } }
    );
    await StoreOrders.update(
      {
        delivered: true,
        delivered_at: new Date(datePast),
        delivery_status: DeliveryStatus.DELIVERED,
        order_status: OrderStatus.COMPLETED,
      },
      { where: { order_id: { [Op.or]: [order_id1, order_id2] } } }
    );

    const { body } = await customRequest({
      path: `/orders/settlestore`,
      method: "post",
      payload: {
        store_order_ids: [store_order_id1, store_order_id2],
        store_id,
      },
    });
    const { settlement_id } = body.data.settlement;

    const responseOne = await customRequest({ path: `/settlement/${settlement_id}`, token });
    const responseAll = await customRequest({ path: `/settlement/store/${store_id}`, token });

    expectSuccess(responseOne);
    expectSuccess(responseAll);
    expect(responseOne.body.data.settlement.store_id).toBe(store_id);
    expect(responseAll.body.data.settlements.length).toBeGreaterThan(0);
  });

  it("Admin process settlement", async () => {
    const { store_id } = await storeFake.rawCreate();

    const body = {
      amount: 122,
      store_id,
      store_order_ids: [],
    };
    const { settlement_id } = await createModel<VendorSettlementInstance>(
      VendorSettlement,
      body,
      "settlement_id"
    );
    const reponse = await customRequest({
      method: "post",
      path: `/settlement/${settlement_id}`,
    });

    expectSuccess(reponse);
    expect(reponse.body.data.settlement.processed).toBeTruthy();
  });
});
