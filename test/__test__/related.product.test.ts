import productFake from "../factories/product.fake";
import { expectError, expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Related Product Tests...", () => {
  let productId: string;
  let relatedProductId: string;

  it("Can create/add related product", async () => {
    const { product_id } = await productFake.rawCreate();
    const { product_id: related1 } = await productFake.rawCreate();
    const { product_id: related2 } = await productFake.rawCreate();
    productId = product_id;
    relatedProductId = related1;

    const response = await request({
      path: `/related-product`,
      method: "post",
      payload: {
        product_id,
        related_product_ids: [related1, related2],
      },
    });

    expectSuccess(response);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("Should fail when product id & related product id are the same", async () => {
    const { product_id } = await productFake.rawCreate();

    const response = await request({
      path: `/related-product`,
      method: "post",
      payload: {
        product_id,
        related_product_ids: [product_id],
      },
    });

    expectError(response);
  });

  it("Can remove related product", async () => {
    const response = await request({
      path: `/related-product`,
      method: "delete",
      payload: { product_id: productId, related_product_id: relatedProductId },
    });

    expectSuccess(response);
    expect(response.body.data).toBeTruthy();
  });

  it("Can find product related products", async () => {
    const response = await request(`/related-product/${productId}`);

    expectSuccess(response);
    expect(response.body.data.products.length).toBeGreaterThan(0);
  });
});
