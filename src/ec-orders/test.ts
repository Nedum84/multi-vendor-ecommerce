import { CREATED } from "http-status";
import { Op } from "sequelize";
import { DeliveryStatus, OrderStatus } from "./types";
import { Orders, StoreOrders } from "../ec-models";
import { generateChars } from "../ec-utils/random.string";
import cartFake from "../ec-cart/test.faker";
import productFake from "../ec-product/test.faker";
import productVariationFake from "../ec-product-variation/test.faker";
import userAddressFake from "../ec-user-address/test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";
import { generateNewCoupon } from "../ec-coupon/utils";
import couponFaker from "../ec-coupon/test.faker";
import { RETURNABLE_DAYS } from "./constants";
import { PaymentChannel } from "../ec-topup/types";

describe("Order Tests...", () => {
  it("Can create order without coupon", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { variation_id: variation_id1 } = await productVariationFake.rawCreate();
    const { variation_id: variation_id2 } = await productVariationFake.rawCreate();
    const { variation_id: variation_id3 } = await productVariationFake.rawCreate();
    //Populate carts
    await customRequest({
      path: `/cart`,
      method: "patch",
      payload: { variation_id: variation_id1, action: "add" },
      token,
    });
    await customRequest({
      path: `/cart`,
      method: "patch",
      payload: { variation_id: variation_id2, action: "add" },
      token,
    });
    await customRequest({
      path: `/cart`,
      method: "patch",
      payload: { variation_id: variation_id3, action: "add" },
      token,
    });
    await customRequest({
      path: `/cart`,
      method: "patch",
      payload: { variation_id: variation_id1, action: "add" },
      token,
    });
    await customRequest({
      path: `/cart`,
      method: "patch",
      payload: { variation_id: variation_id2, action: "add" },
      token,
    });
    await customRequest({
      path: `/cart`,
      method: "patch",
      payload: { variation_id: variation_id3, action: "add" },
      token,
    });
    await customRequest({
      path: `/cart`,
      method: "patch",
      payload: { variation_id: variation_id1, action: "add" },
      token,
    });
    const response = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    expectSuccess(response, CREATED);
    expect(response.body.data.order.order_id).toBeDefined();
  });
  it("Can create order with coupon", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id: variation_id1, product: product1 } =
      await productVariationFake.rawCreate();
    const { variation_id: variation_id2, product: product2 } =
      await productVariationFake.rawCreate();
    const { variation_id: variation_id3, product: product3 } =
      await productVariationFake.rawCreate();
    const { store_id: store_id1 } = product1;
    const { store_id: store_id2 } = product2;
    const { store_id: store_id3 } = product3;
    //Just to add/create extra product for store_id1
    const { variations } = await productFake.rawCreate({ store_id: store_id1 });
    const { variation_id: variation_id4 } = variations[0];
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id: variation_id1 });
    await cartFake.rawCreate({ qty: 2, user_id, variation_id: variation_id4 });
    await cartFake.rawCreate({ qty: 8, user_id, variation_id: variation_id2 });
    await cartFake.rawCreate({ qty: 6, user_id, variation_id: variation_id3 });
    const coupon_code = await generateNewCoupon();
    const stores = [{ store_id: store_id1 }, { store_id: store_id2 }];
    const storesPayload = await couponFaker.storeRestriction({ stores });
    //create coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...storesPayload, coupon_code },
    });
    const response = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id, coupon_code },
      token,
    });
    const { order } = response.body.data;
    const { amount, sub_total, coupon_amount, shipping_amount, tax_amount, store_orders } = order;
    let totalSubOrderAmount = 0;
    let totalStoreOrdersubTotal = 0;
    let totalSubOrderCouponAmount = 0;
    let totalStoreOrdershippingAmount = 0;
    let totalSubOrderTaxAmount = 0;
    store_orders.forEach((sub_order: any) => {
      const { amount, sub_total, coupon_amount, shipping_amount, tax_amount, products } = sub_order;
      totalSubOrderAmount += amount;
      totalStoreOrdersubTotal += sub_total;
      totalSubOrderCouponAmount += coupon_amount;
      totalStoreOrdershippingAmount += shipping_amount;
      totalSubOrderTaxAmount += tax_amount;
      const totalProductPurchasedPrice = products.reduce(
        (total: any, cur: any) => total + cur.purchased_price * cur.qty,
        0
      );
      expect(sub_total).toBe(totalProductPurchasedPrice);
    });
    const store3SubOrder = store_orders.find((sub_order: any) => sub_order.store_id === store_id3);
    expectSuccess(response, CREATED);

    expect(amount).toBe(totalSubOrderAmount);
    expect(sub_total).toBe(totalStoreOrdersubTotal);
    expect(coupon_amount).toBe(totalSubOrderCouponAmount);
    expect(shipping_amount).toBe(totalStoreOrdershippingAmount);
    expect(tax_amount).toBe(totalSubOrderTaxAmount);
    expect(amount).toBe(sub_total - coupon_amount + shipping_amount + tax_amount);
    expect(store3SubOrder.coupon_amount).toBe(0);
  });
  it("Can update order payment using User's Wallet", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    // Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // Topup Wallet
    await customRequest({
      path: `/topup`,
      method: "post",
      token,
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.SQUAD,
        amount: 232310,
      },
    });
    // create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const response = await customRequest({
      path: `/orders/payment`,
      method: "patch",
      payload: { order_id: order.order_id, payed_from_wallet: true },
      token,
    });

    expectSuccess(response);
    expect(response.body.data.order.payment_completed).toBeTruthy();
    expect(response.body.data.order.payed_from_wallet).toBeTruthy();
  });
  it("Can update order payment using buy now pay later", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id } = await productVariationFake.rawCreate();
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const { order_id } = order;
    const response = await customRequest({
      token,
      path: `/orders/payment`,
      method: "patch",
      payload: {
        order_id,
        payed_from_wallet: false,
        buy_now_pay_later: {
          account_no: "08913411353",
          code: "567891318626",
        },
      },
    });

    expectSuccess(response);
    expect(response.body.data.order.payment_completed).toBeTruthy();
    expect(response.body.data.order.payment).toBeDefined();
  });
  it("Admin can update user's order payment", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id } = await productVariationFake.rawCreate();
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const response = await customRequest({
      path: `/orders/payment/admin`,
      method: "patch",
      payload: {
        order_id: order.order_id,
      },
    });
    expectSuccess(response);
    expect(response.body.data.order.payment_completed).toBeTruthy();
    expect(response.body.data.order.purchased_by).toBe(user.user_id);
  });
  it("Admin/Store can update order status", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id } = await productVariationFake.rawCreate();
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const { store_order_id } = order.store_orders[0];
    const response = await customRequest({
      path: `/orders/update-order/${store_order_id}`,
      method: "patch",
      payload: { order_status: OrderStatus.COMPLETED },
    });
    expectSuccess(response);
    expect(response.body.data.sub_order.order_status).toBe(OrderStatus.COMPLETED);
  });
  it("Admin/Store can update order delivery status", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id } = await productVariationFake.rawCreate();
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const { order_id } = order;
    const { store_order_id } = order.store_orders[0];
    //Update Payment
    await customRequest({
      path: `/orders/payment/admin`,
      method: "patch",
      payload: { order_id },
    });
    const response = await customRequest({
      path: `/orders/update-delivery/${store_order_id}`,
      method: "patch",
      payload: { delivery_status: DeliveryStatus.DELIVERED },
    });
    expectSuccess(response);
    expect(response.body.data.sub_order.delivery_status).toBe(DeliveryStatus.DELIVERED);
    expect(response.body.data.sub_order.delivered).toBeTruthy();
  });
  it("User/Customer can cancel order", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id } = await productVariationFake.rawCreate();
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const { store_order_id } = order.store_orders[0];
    const response = await customRequest({
      path: `/orders/user/cancel/${store_order_id}`,
      method: "patch",
      token,
    });
    expectSuccess(response);
    expect(response.body.data.sub_order.order_status).toBe(OrderStatus.CANCELLED);
  });
  it("Admin can process refund", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    //Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // //create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order } = body.data;
    const { order_id } = order;
    const { store_order_id } = order.store_orders[0];
    //Update Payment
    await customRequest({
      path: `/orders/payment/admin`,
      method: "patch",
      payload: { order_id },
    });
    //Cancel Order
    await customRequest({
      path: `/orders/user/cancel/${store_order_id}`,
      method: "patch",
      token,
    });
    const amount = 200;
    const response = await customRequest({
      path: `/orders/refund/${store_order_id}`,
      method: "patch",
      payload: { amount },
    });
    const { body: balanceBody } = await customRequest({ path: `/wallet`, token });
    expectSuccess(response);
    expect(response.body.data.sub_order.order_status).toBe(OrderStatus.CANCELLED);
    expect(response.body.data.sub_order.refunded).toBeTruthy();
    expect(balanceBody.data.balance).toBe(amount);
  });
  it("Admin can settle store", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    // --> ORDER #1
    // Populate carts #1
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
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
    await cartFake.rawCreate({ qty: 3, user_id, variation_id });
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
    const datePast = Date.now() - (RETURNABLE_DAYS + 2) * 24 * 3600 * 1000;
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

    const response = await customRequest({
      path: `/orders/settlestore`,
      method: "post",
      payload: {
        store_order_ids: [store_order_id1, store_order_id2],
        store_id,
      },
    });

    expectSuccess(response);
    expect(response.body.data.settlement.settlement_id).toBeDefined();
    expect(response.body.data.settlement.store_order_ids.length).toBeGreaterThan(0);
    expect(response.body.data.settlement.amount).toBeGreaterThan(0);
  });
  it("Can get store unsettled orders", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    // --> ORDER #1
    // Populate carts #1
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // create order
    const { body: body1 } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id: order_id1 } = body1.data.order;
    // --> ORDER #2
    // Populate carts #2
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // create order
    const { body: body2 } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id: order_id2 } = body2.data.order;

    //2days behind returnable days in milliseconds
    const datePast = Date.now() - (RETURNABLE_DAYS + 2) * 24 * 3600 * 1000;
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
    const response = await customRequest(`/orders/unsettled/${store_id}`);
    expectSuccess(response);
    expect(response.body.data.store_orders.length).toBe(2);
  });
  it("Can find order by order id", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    // Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id } = body.data.order;
    const response = await customRequest(`/orders/${order_id}`);
    expectSuccess(response);
    expect(response.body.data.order.order_id).toBe(order_id);
  });
  it("Can find order by order id", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    // Populate carts
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id } = body.data.order;
    const response = await customRequest(`/orders/${order_id}`);
    expectSuccess(response);
    expect(response.body.data.order.order_id).toBe(order_id);
  });
  it("Can find many orders by searches", async () => {
    const { tokens, user } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });
    const { token } = tokens.access;
    const { user_id } = user;
    const { variation_id, product } = await productVariationFake.rawCreate();
    const { store_id } = product;
    const coupon_code = await generateNewCoupon();
    const stores = [{ store_id }];
    const storesPayload = await couponFaker.storeRestriction({ stores });
    //create coupon
    await customRequest({
      path: `/coupon`,
      method: "post",
      payload: { ...storesPayload, coupon_code },
    });
    //CREATE ORDER #1
    await cartFake.rawCreate({ qty: 5, user_id, variation_id });
    // create order
    const { body } = await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id },
      token,
    });
    const { order_id, store_orders, amount } = body.data.order;
    const { store_order_id } = store_orders[0];
    //CREATE ORDER #2
    await cartFake.rawCreate({ qty: 3, user_id, variation_id });
    // create order
    await customRequest({
      path: `/orders`,
      method: "post",
      payload: { address_id, coupon_code },
      token,
    });
    //CREATE ORDER #3
    await cartFake.rawCreate({ qty: 2, user_id, variation_id });
    // create order
    await customRequest({ path: `/orders`, method: "post", payload: { address_id }, token });
    const response1 = await customRequest(`/orders`);
    const response2 = await customRequest(`/orders?search_query=${order_id}`);
    const response3 = await customRequest(`/orders?user_id=${user_id}`);
    const response4 = await customRequest(`/orders?order_status=${OrderStatus.PENDING}`);
    const response5 = await customRequest(`/orders?coupon_code=${coupon_code}`);
    const response6 = await customRequest(`/orders?refunded=${false}`);
    const response7 = await customRequest(`/orders?store_id=${store_id}`);
    const response8 = await customRequest(`/orders?search_query=${store_order_id}`);
    const response9 = await customRequest(`/orders?amount=${amount}`);
    expectSuccess(response1);
    expect(response1.body.data.orders.length).toBeGreaterThan(0);
    expect(response2.body.data.orders.length).toBeGreaterThan(0);
    expect(response3.body.data.orders.length).toBeGreaterThan(0);
    expect(response4.body.data.orders.length).toBeGreaterThan(0);
    expect(response5.body.data.orders.length).toBeGreaterThan(0);
    expect(response6.body.data.orders.length).toBeGreaterThan(0);
    expect(response7.body.data.orders.length).toBeGreaterThan(0);
    expect(response8.body.data.orders.length).toBeGreaterThan(0);
    expect(response9.body.data.orders.length).toBeGreaterThan(0);
  });
});
