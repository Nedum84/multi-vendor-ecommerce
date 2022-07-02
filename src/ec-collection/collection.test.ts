import { CREATED } from "http-status";
import collectionFake from "./collection.fake";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Product Collection Tests...", () => {
  it("Can create collection", async () => {
    const payload = collectionFake.create;
    const response = await customRequest({
      path: `/collection`,
      method: "post",
      payload,
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.collection.name).toBe(payload.name);
  });

  it("Can update collection", async () => {
    const { collection_id } = await collectionFake.rawCreate();

    const payload = collectionFake.update;
    const response = await customRequest({
      path: `/collection/${collection_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.collection.name).toBe(payload.name);
  });

  it("Can find by collection_id", async () => {
    const { collection_id } = await collectionFake.rawCreate();

    const response = await customRequest({
      path: `/collection/${collection_id}`,
    });

    expectSuccess(response);
    expect(response.body.data.collection.name).toBeDefined();
  });

  it("Can find all collections", async () => {
    const response = await customRequest(`/collection`);

    expectSuccess(response);
    expect(response.body.data.collections.length).not.toBe(0);
  });
});
