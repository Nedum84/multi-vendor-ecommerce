import { Op } from "sequelize/dist";
import { DeliveryStatus, OrderStatus } from "../../src/enum/orders.enum";
import { Orders, SubOrders, VendorSettlement } from "../../src/models";
import { VendorSettlementInstance } from "../../src/models/vendor.settlement.model";
import CONSTANTS from "../../src/utils/constants";
import { createModel } from "../../src/utils/random.string";
import cartFake from "../factories/cart.fake";
import productVariationFake from "../factories/product.variation.fake";
import storeFake from "../factories/store.fake";
import userAddressFake from "../factories/user.address.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

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
    const { body: body1 } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { order_id: order_id1, sub_orders: sub_orders1 } = body1.data.order;
    const { sub_order_id: sub_order_id1 } = sub_orders1[0];
    // --> ORDER #2
    // Populate carts #2
    await cartFake.rawCreate({ qty: 3, store_id, user_id, variation_id });
    // create order
    const { body: body2 } = await request({ path: `/orders`, method: "post", payload: { address_id }, token });
    const { order_id: order_id2, sub_orders: sub_orders2 } = body2.data.order;
    const { sub_order_id: sub_order_id2 } = sub_orders2[0];
    //2days behind returnable days in milliseconds
    const datePast = Date.now() - (CONSTANTS.RETURNABLE_DAYS + 2) * 24 * 3600 * 1000;
    await Orders.update({ payment_completed: true }, { where: { order_id: { [Op.or]: [order_id1, order_id2] } } });
    await SubOrders.update(
      {
        delivered: true,
        delivered_at: new Date(datePast),
        delivery_status: DeliveryStatus.DELIVERED,
        order_status: OrderStatus.COMPLETED,
      },
      { where: { order_id: { [Op.or]: [order_id1, order_id2] } } }
    );

    const { body } = await request({
      path: `/orders/settlestore`,
      method: "post",
      payload: {
        sub_order_ids: [sub_order_id1, sub_order_id2],
        store_id,
      },
    });
    const { settlement_id } = body.data.settlement;

    const responseOne = await request({ path: `/settlement/${settlement_id}`, token });
    const responseAll = await request({ path: `/settlement/store/${store_id}`, token });

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
      sub_order_ids: [],
    };
    const { settlement_id } = await createModel<VendorSettlementInstance>(VendorSettlement, body, "settlement_id");
    const reponse = await request({
      method: "post",
      path: `/settlement/${settlement_id}`,
    });

    expectSuccess(reponse);
    expect(reponse.body.data.settlement.processed).toBeTruthy();
  });
});
