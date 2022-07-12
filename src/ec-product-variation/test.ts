import { expectSuccess } from "../ec-test-utils/utils";
import httpStatus from "http-status";
import productVariationFake from "./product.variation.fake";
import productFake from "../ec-product/product.fake";
import variationAttributesFake from "../ec-variation-attributes/variation.attributes.fake";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Product Variation Tests", () => {
  it("Can create a variation", async () => {
    //create product with no variation(Never going to be possible except in test env)
    const { product_id } = await productFake.rawCreate({ variation: null });

    const response = await customRequest({
      path: `/variation`,
      method: "post",
      payload: { ...productVariationFake.create, product_id },
    });

    expect(response.body.data).toBeDefined();
    expectSuccess(response, httpStatus.CREATED);
  });

  it("Can create a variation with attribute sets", async () => {
    const { attribute_id: attr1 } = await variationAttributesFake.rawCreate(); //eg. color: ;
    const { attribute_id: attr2 } = await variationAttributesFake.rawCreate(); // eg. size

    const { attribute_set_id: attr_set1 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr1,
    }); //eg. blue
    const { attribute_set_id: attr_set2 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr1,
    }); //eg. red

    const { attribute_set_id: attr_set3 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr2,
    }); //eg. XL
    const { attribute_set_id: attr_set4 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr2,
    }); //eg. XXL

    //create product
    const variation = (await productFake.create()).variation;
    //@ts-ignore
    variation.is_default = true;
    const { product_id } = await productFake.rawCreate({ variation });
    //Create product attributes
    const { body } = await customRequest({
      path: `/attributes/product-attribute`,
      method: "post",
      payload: {
        product_id,
        attribute_ids: [attr1, attr2],
      },
    });

    //product variation #1
    const response1 = await customRequest({
      path: `/variation`,
      method: "post",
      payload: {
        ...productVariationFake.create,
        product_id,
        attribute_set_ids: [attr_set1, attr_set4], //eg. blue, XXL {{ NOTE: Default vaiation =  blue, XL (attr_set1, attr_set3), i.e Inititial(0) attrs }}
      },
    });

    //product variation #2
    const response2 = await customRequest({
      path: `/variation`,
      method: "post",
      payload: {
        ...productVariationFake.create,
        product_id,
        attribute_set_ids: [attr_set2, attr_set4], //eg. red, XXL
      },
    });

    //product variation #3
    const response3 = await customRequest({
      path: `/variation`,
      method: "post",
      payload: {
        ...productVariationFake.create,
        product_id,
        attribute_set_ids: [attr_set2, attr_set3], //eg. red, XL
      },
    });

    expectSuccess(response1, httpStatus.CREATED);
    expectSuccess(response2, httpStatus.CREATED);
    expectSuccess(response3, httpStatus.CREATED);
  });

  it("Can update a variation with attribute sets", async () => {
    const { attribute_id: attr1 } = await variationAttributesFake.rawCreate(); //eg. color: ;
    const { attribute_id: attr2 } = await variationAttributesFake.rawCreate(); // eg. size

    const { attribute_set_id: attr_set1 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr1,
    }); //eg. blue
    const { attribute_set_id: attr_set2 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr1,
    }); //eg. red

    const { attribute_set_id: attr_set3 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr2,
    }); //eg. XL
    const { attribute_set_id: attr_set4 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr2,
    }); //eg. XXL

    //create product
    const variation = (await productFake.create()).variation;
    // @ts-ignore
    variation.is_default = true;
    const { product_id } = await productFake.rawCreate({ variation });
    //Create product attributes
    const { body } = await customRequest({
      path: `/attributes/product-attribute`,
      method: "post",
      payload: {
        product_id,
        attribute_ids: [attr1, attr2],
      },
    });

    //create variation
    const { body: variationBody } = await customRequest({
      path: `/variation`,
      method: "post",
      payload: {
        ...productVariationFake.create,
        product_id,
        attribute_set_ids: [attr_set1, attr_set4], //eg. blue, XXL {{ NOTE: Default vaiation =  blue, XL (attr_set1, attr_set3), i.e Inititial(0) attrs }}
      },
    });

    const { variation_id } = variationBody.data.variation;
    //update variation #1
    const payload = productVariationFake.update;
    const response = await customRequest({
      path: `/variation/${variation_id}`,
      method: "patch",
      payload: {
        ...payload,
        attribute_set_ids: [attr_set2, attr_set4], //eg. red, XXL
      },
    });

    expectSuccess(response);
    expect(response.body.data.variation.sku).toBe(payload.sku);
  });

  it("Can delete variation", async () => {
    const { attribute_id: attr1 } = await variationAttributesFake.rawCreate(); //eg. color: ;
    const { attribute_id: attr2 } = await variationAttributesFake.rawCreate(); // eg. size

    const { attribute_set_id: attr_set1 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr1,
    }); //eg. blue
    const { attribute_set_id: attr_set2 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr1,
    }); //eg. red

    const { attribute_set_id: attr_set3 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr2,
    }); //eg. XL
    const { attribute_set_id: attr_set4 } = await variationAttributesFake.rawCreateAttributeSet({
      attribute_id: attr2,
    }); //eg. XXL

    //create product
    const variation = (await productFake.create()).variation;
    //@ts-ignore
    variation.is_default = true;
    const { product_id } = await productFake.rawCreate({ variation });
    //Create product attributes
    const { body } = await customRequest({
      path: `/attributes/product-attribute`,
      method: "post",
      payload: {
        product_id,
        attribute_ids: [attr1, attr2],
      },
    });

    //create variation
    const { body: variationBody } = await customRequest({
      path: `/variation`,
      method: "post",
      payload: {
        ...productVariationFake.create,
        product_id,
        attribute_set_ids: [attr_set1, attr_set4], //eg. blue, XXL {{ NOTE: Default vaiation =  blue, XL (attr_set1, attr_set3), i.e Inititial(0) attrs }}
      },
    });

    const { variation_id } = variationBody.data.variation;
    //delete variation
    const response = await customRequest({
      path: `/variation/${variation_id}`,
      method: "delete",
    });

    expectSuccess(response);
    expect(response.body.data).toBeTruthy();
  });

  it("Can get variation by ID", async () => {
    const { variation_id, sku } = await productVariationFake.rawCreate();

    const response = await customRequest(`/variation/${variation_id}`);

    expectSuccess(response);
    expect(response.body.data.variation.sku).toBe(sku);
  });
  it("Can get all variations by product ID", async () => {
    const { product_id } = await productVariationFake.rawCreate();

    const response = await customRequest(`/variation/product/${product_id}`);

    expectSuccess(response);
    expect(response.body.data.variations.length).toBeGreaterThan(0);
  });
});
