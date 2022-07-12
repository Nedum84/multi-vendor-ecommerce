import { CREATED } from "http-status";
import { CollectStatus } from "../ec-collection/types";
import categoryFake from "../ec-category/category.fake";
import collectionFake from "../ec-collection/collection.fake";
import productFake from "./product.fake";
import tagFake from "../ec-tag/tag.fake";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Product Tests...", () => {
  it("Can create a product", async () => {
    const payload = await productFake.create();

    const response = await customRequest({
      path: `/product`,
      method: "post",
      payload,
    });

    expect(response.body.data.product.name).toBe(payload.name);
    expectSuccess(response, CREATED);
  });

  it("Can update a product", async () => {
    const { product_id } = await productFake.rawCreate();
    const payload = productFake.update;

    const response = await customRequest({
      path: `/product/${product_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.product.name).toBe(payload.name);
  });

  it("Can delete product collection", async () => {
    const { collection_id: id1 } = await collectionFake.rawCreate();
    const { collection_id: id2 } = await collectionFake.rawCreate();
    const { product_id } = await productFake.rawCreate({ collection_ids: [id1, id2] });

    const response = await customRequest({
      path: `/product/collection`,
      payload: { product_id, collection_ids: [id1] },
      method: "delete",
    });

    expectSuccess(response);
  });

  it("Can delete product category", async () => {
    const { category_id: id1 } = await categoryFake.rawCreate();
    const { category_id: id2 } = await categoryFake.rawCreate();
    const { product_id } = await productFake.rawCreate({ category_ids: [id1, id2] });

    const response = await customRequest({
      path: `/product/category`,
      payload: { product_id, category_ids: [id1] },
      method: "delete",
    });

    expectSuccess(response);
  });

  it("Can delete product tag", async () => {
    const { tag_id: id1 } = await tagFake.rawCreate();
    const { tag_id: id2 } = await tagFake.rawCreate();
    const { product_id } = await productFake.rawCreate({ tag_ids: [id1, id2] });

    const response = await customRequest({
      path: `/product/tag`,
      payload: { product_id, tag_ids: [id1] },
      method: "delete",
    });

    expect(response.body.data).toBeTruthy();
    expectSuccess(response);
  });
  it("Can get a product by id", async () => {
    const { product_id } = await productFake.rawCreate();

    const response = await customRequest(`/product/${product_id}`);
    expectSuccess(response);
    expect(response.body.data.product.name).not.toBeUndefined();
  });

  it("Can find all products", async () => {
    const payload = await productFake.create();
    const payload2 = await productFake.create();
    const payload3 = await productFake.create();

    //create products
    await productFake.rawCreate(payload);
    await productFake.rawCreate(payload2);
    await productFake.rawCreate(payload3);

    const response1 = await customRequest(`/product?search_query=${payload.name}`);
    const response2 = await customRequest(`/product?store_id=${payload.store_id}`);
    const response3 = await customRequest(`/product?category_id=${payload.category_ids[0]}`);
    const response4 = await customRequest(`/product?is_featured=${payload.is_featured}`);
    const response5 = await customRequest(`/product?collection_id=${payload3.collection_ids[0]}`);

    expect(response1.body.data.products.length).not.toBe(0);
    expect(response2.body.data.products.length).not.toBe(0);
    expect(response3.body.data.products.length).not.toBe(0);
    expect(response4.body.data.products.length).not.toBe(0);
    expect(response5.body.data.products.length).not.toBe(0);
  });

  it("Can find latest/hot products", async () => {
    const { category_id } = await categoryFake.rawCreate({ is_featured: true });
    const { collection_id } = await collectionFake.rawCreate({ status: CollectStatus.PUBLISHED });

    //create products
    await productFake.rawCreate({ category_ids: [category_id] });
    await productFake.rawCreate({ collection_ids: [collection_id] });
    await productFake.rawCreate({ collection_ids: [collection_id] });

    const response = await customRequest(`/product/latest`);

    expect(response.body.data.collections.length).not.toBe(0);
    expect(response.body.data.categories.length).not.toBe(0);
  });
});
