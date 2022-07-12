import { CREATED } from "http-status";
import tagFake from "./test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Product Tag Tests...", () => {
  it("Can create tag", async () => {
    const payload = tagFake.create;
    const response = await customRequest({ path: `/tag`, method: "post", payload });

    expectSuccess(response, CREATED);
    expect(response.body.data.tag.name).toBe(payload.name);
  });

  it("Can update tag", async () => {
    const { tag_id } = await tagFake.rawCreate();

    const payload = tagFake.update;
    const response = await customRequest({
      path: `/tag/${tag_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.tag.name).toBe(payload.name);
  });

  it("Can find by tag_id", async () => {
    const { tag_id } = await tagFake.rawCreate();

    const response = await customRequest({
      path: `/tag/${tag_id}`,
    });

    expectSuccess(response);
    expect(response.body.data.tag.name).toBeDefined();
  });

  it("Can find all tags", async () => {
    const response = await customRequest(`/tag`);

    expectSuccess(response);
    expect(response.body.data.tags.length).not.toBe(0);
  });
});
