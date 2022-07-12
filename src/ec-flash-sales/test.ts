import { CREATED } from "http-status";
import flashSalesFake from "./test.faker";
import productVariationFake from "../ec-product-variation/test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Flash Sales Tests...", () => {
  it("Can create flashsales", async () => {
    const payload = flashSalesFake.create;
    const response = await customRequest({
      path: `/flashsales`,
      method: "post",
      payload,
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.flash_sale.name).toBe(payload.name);
  });

  it("Can update flashsales", async () => {
    const { flash_sale_id } = await flashSalesFake.rawCreate();

    const payload = flashSalesFake.update;
    const response = await customRequest({
      path: `/flashsales/${flash_sale_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.flash_sale.name).toBe(payload.name);
  });

  it("Can revoke flashsales", async () => {
    const { flash_sale_id } = await flashSalesFake.rawCreate();

    const response = await customRequest({
      path: `/flashsales/${flash_sale_id}`,
      method: "delete",
    });

    expectSuccess(response);
    expect(response.body.data.flash_sale.revoke).toBeTruthy();
  });

  it("Can find by flash_sale_id", async () => {
    const { flash_sale_id } = await flashSalesFake.rawCreate();

    const response = await customRequest({
      path: `/flashsales/${flash_sale_id}`,
    });

    expectSuccess(response);
    expect(response.body.data.flash_sale.name).toBeDefined();
  });

  it("Can find all flashsaless", async () => {
    await flashSalesFake.rawCreate();
    await flashSalesFake.rawCreate();
    await flashSalesFake.rawCreate();
    const response = await customRequest(`/flashsales`);

    expectSuccess(response);
    expect(response.body.data.flash_sales.length).not.toBe(0);
  });

  it("Can upsert flashsale products", async () => {
    const { flash_sale_id } = await flashSalesFake.rawCreate();
    const { variation_id: variation_id1, price: price1 } = await productVariationFake.rawCreate();
    const { variation_id: variation_id2, price: price2 } = await productVariationFake.rawCreate();

    const payload = [
      { variation_id: variation_id1, price: price1 * 0.6, qty: 20 },
      { variation_id: variation_id2, price: price2 * 0.6, qty: 32 },
    ];
    const response = await customRequest({
      path: `/flashsales/product/${flash_sale_id}`,
      method: "post",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.products[0].price).toBe(price1 * 0.6);
  });

  it("Can remove flashsale products", async () => {
    const { flash_sale_id } = await flashSalesFake.rawCreate();
    const { variation_id: variation_id1, price: price1 } = await productVariationFake.rawCreate();
    const { variation_id: variation_id2, price: price2 } = await productVariationFake.rawCreate();

    const payload = [
      { variation_id: variation_id1, price: price1 * 0.6, qty: 20 },
      { variation_id: variation_id2, price: price2 * 0.6, qty: 32 },
    ];
    //create products flash sales
    await customRequest({
      path: `/flashsales/product/${flash_sale_id}`,
      method: "post",
      payload,
    });

    const response = await customRequest({
      path: `/flashsales/product/${flash_sale_id}`,
      method: "delete",
      payload: { variation_id: variation_id1 },
    });

    expectSuccess(response);
    expect(response.body.data).toBeTruthy();
  });

  it("Can apply flashsale on products", async () => {
    const { flash_sale_id } = await flashSalesFake.rawCreate();
    const { variation_id: variation_id1, price: price1 } = await productVariationFake.rawCreate();
    const { variation_id: variation_id2, price: price2 } = await productVariationFake.rawCreate();

    const payload = [
      { variation_id: variation_id1, price: price1 * 0.6, qty: 20 },
      { variation_id: variation_id2, price: price2 * 0.6, qty: 32 },
    ];
    //create products flash sales
    await customRequest({
      path: `/flashsales/product/${flash_sale_id}`,
      method: "post",
      payload,
    });

    const response = await customRequest({ path: `/variation/${variation_id1}` });

    const { flash_discount } = response.body.data.variation;

    expectSuccess(response);
    expect(flash_discount.price).toBe(price1 * 0.6);
  });
});
