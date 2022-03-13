import { CREATED } from "http-status";
import tagFake from "../factories/tag.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Product Tag Tests...", () => {
  it("Can create tag", async () => {
    const payload = tagFake.create;
    const response = await request({ path: `/tag`, method: "post", payload });

    expectSuccess(response, CREATED);
    expect(response.body.data.tag.name).toBe(payload.name);
  });

  it("Can update tag", async () => {
    const { tag_id } = await tagFake.rawCreate();

    const payload = tagFake.update;
    const response = await request({
      path: `/tag/${tag_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.tag.name).toBe(payload.name);
  });

  it("Can find by tag_id", async () => {
    const { tag_id } = await tagFake.rawCreate();

    const response = await request({
      path: `/tag/${tag_id}`,
    });

    expectSuccess(response);
    expect(response.body.data.tag.name).toBeDefined();
  });

  it("Can find all tags", async () => {
    const response = await request(`/tag`);

    expectSuccess(response);
    expect(response.body.data.tags.length).not.toBe(0);
  });
});
