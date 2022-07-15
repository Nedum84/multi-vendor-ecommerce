import { expectSuccess } from "../ec-test-utils/utils";
import httpStatus from "http-status";
import variationAttributesFake from "./variation.attributes.fake";
import productFake from "../ec-product/test.faker";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Variation Attributes Tests...", () => {
  it("Can create attribute", async () => {
    const response = await customRequest({
      path: `/attributes/attribute`,
      method: "post",
      payload: variationAttributesFake.create,
    });

    expectSuccess(response, httpStatus.CREATED);
  });

  it("Can update attribute", async () => {
    const { attribute_id } = await variationAttributesFake.rawCreate();

    const payload = variationAttributesFake.update;
    const response = await customRequest({
      path: `/attributes/attribute/${attribute_id}`,
      method: "patch",
      payload,
    });

    expect(response.body.data.attribute.name).toBe(payload.name);
    expectSuccess(response);
  });
  it("Can find all attributes", async () => {
    //Create some attributes
    await variationAttributesFake.rawCreate();
    await variationAttributesFake.rawCreate();
    const response = await customRequest(`/attributes/attributes`);

    expectSuccess(response);
    expect(response.body.data.attributes.length).toBeGreaterThan(0);
  });

  it("Can create attribute set", async () => {
    const { attribute_id } = await variationAttributesFake.rawCreate();

    const response = await customRequest({
      path: `/attributes/attribute-set/${attribute_id}`,
      payload: variationAttributesFake.createAttributeSet,
      method: "post",
    });

    expect(response.body.data.attribute_sets.length).toBeGreaterThan(0);
    expectSuccess(response, httpStatus.CREATED);
  });

  it("Can update attribute sets", async () => {
    const { attribute_set_id } = await variationAttributesFake.rawCreateAttributeSet();

    const payload = variationAttributesFake.updateAttributeSet;
    const response = await customRequest({
      path: `/attributes/attribute-set/${attribute_set_id}`,
      method: "patch",
      payload,
    });

    expect(response.body.data.attribute_sets.length).toBeGreaterThan(0);
    expectSuccess(response);
  });

  it("Can find all attribute sets by attribute_id", async () => {
    const { attribute_id } = await variationAttributesFake.rawCreate();
    //Create some attr sets
    await variationAttributesFake.rawCreateAttributeSet({ attribute_id });
    await variationAttributesFake.rawCreateAttributeSet({ attribute_id });
    await variationAttributesFake.rawCreateAttributeSet({ attribute_id });

    const response = await customRequest(`/attributes/attribute-set/${attribute_id}`);

    expect(response.body.data.attribute_sets.length).toBeGreaterThan(0);
    expectSuccess(response);
  });

  it("Can create product attributes", async () => {
    const { attribute_id: attr1 } = await variationAttributesFake.rawCreate();
    const { attribute_id: attr2 } = await variationAttributesFake.rawCreate();
    const { attribute_id: attr3 } = await variationAttributesFake.rawCreate();

    const { product_id } = await productFake.rawCreate();

    const response = await customRequest({
      path: `/attributes/product-attribute`,
      payload: {
        product_id,
        attribute_ids: [attr1, attr2, attr3],
      },
      method: "post",
    });

    expectSuccess(response);
    expect(response.body.data.product_attributes.length).not.toBe(0);
  });

  it("Can find product attributes", async () => {
    const { attribute_id: attr1 } = await variationAttributesFake.rawCreate();
    const { attribute_id: attr2 } = await variationAttributesFake.rawCreate();
    const { attribute_id: attr3 } = await variationAttributesFake.rawCreate();

    const { product_id } = await productFake.rawCreate();

    await customRequest({
      path: `/attributes/product-attribute`,
      payload: { product_id, attribute_ids: [attr1, attr2, attr3] },
      method: "post",
    });

    const response = await customRequest(`/attributes/product-attribute/${product_id}`);

    expectSuccess(response);
    expect(response.body.data.product_attributes.length).not.toBe(0);
  });
});
