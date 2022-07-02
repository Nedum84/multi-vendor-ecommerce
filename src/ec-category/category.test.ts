import httpStatus from "http-status";
import { customRequest } from "../ec-test-utils/custom.request";
import { expectStructureToBe, expectSuccess } from "../ec-test-utils/utils";
import categoryFake from "./category.fake";

let token: string;
beforeAll(async () => {
  const { tokens } = await global.signin();
  token = tokens?.access?.token;
});

describe("Cours categories Tests", () => {
  it("Can create a category", async () => {
    const response = await customRequest({
      path: `/category`,
      method: "post",
      payload: categoryFake.create,
      token,
    });

    expectSuccess(response, httpStatus.CREATED);
  });

  it("Can update category", async () => {
    const { category_id } = await categoryFake.rawCreate();

    const response = await customRequest({
      path: `/category/${category_id}`,
      method: "patch",
      payload: categoryFake.update,
      token,
    });

    expectSuccess(response);
    expect(response.body.data.category.name).toBe(categoryFake.update.name);
  });

  it("Can get category using tag id", async () => {
    const { category_id } = await categoryFake.rawCreate();
    const response = await customRequest(`/category/${category_id}`);

    expectSuccess(response);
  });

  it("Should find Many categories ", async () => {
    const response = await customRequest(`/category`);
    const { data } = response.body;

    expectSuccess(response);
    expectStructureToBe(data, ["categories"]);
  });

  it("Disable category", async () => {
    const { category_id } = await categoryFake.rawCreate();

    const response = await customRequest({
      path: `/category/${category_id}`,
      method: "patch",
      payload: { active: false },
      token,
    });

    expect(response.body.data.category.active).toBeFalsy();
    expectSuccess(response);
  });
  it("Enable category", async () => {
    const { category_id } = await categoryFake.rawCreate();

    const response = await customRequest({
      path: `/category/${category_id}`,
      method: "patch",
      payload: { active: true },
      token,
    });

    expect(response.body.data.category.active).toBeTruthy();
    expectSuccess(response);
  });

  it("Can find category parents(nested)", async () => {
    const { category_id: d1 } = await categoryFake.rawCreate();
    const { category_id: d2 } = await categoryFake.rawCreate({
      parent_id: d1,
    });
    const { category_id: d3 } = await categoryFake.rawCreate({
      parent_id: d2,
    });
    const { category_id: d4 } = await categoryFake.rawCreate({
      parent_id: d3,
    });
    const { category_id: d5 } = await categoryFake.rawCreate({
      parent_id: d4,
    });
    const { category_id: d6 } = await categoryFake.rawCreate({
      parent_id: d5,
    });

    const response = await customRequest(`/category/parents?category_id=${d6}`);

    expect(response.body.data.categories.length).toBe(6);
    expectSuccess(response);
  });

  it("Can find category children(nested)", async () => {
    const { category_id: d1 } = await categoryFake.rawCreate();
    const { category_id: d2 } = await categoryFake.rawCreate({
      parent_id: d1,
    });
    const { category_id: d3 } = await categoryFake.rawCreate({
      parent_id: d2,
    });
    const { category_id: d4 } = await categoryFake.rawCreate({
      parent_id: d3,
    });
    const { category_id: d5 } = await categoryFake.rawCreate({
      parent_id: d4,
    });
    const { category_id: d6 } = await categoryFake.rawCreate({
      parent_id: d5,
    });

    const response = await customRequest(`/category/children?category_id=${d1}`);

    expect(response.body.data.categories.length).toBe(6);
    expectSuccess(response);
  });
});
