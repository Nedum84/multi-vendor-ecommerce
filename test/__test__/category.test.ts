import { expectSuccess, expectStructureToBe } from "../testing.utils";
import httpStatus from "http-status";
import bookCategoryFake from "../factories/category.fake";

const request = global.buildRequest;

let token: string;
beforeAll(async () => {
  const { tokens } = await global.signin();
  token = tokens?.access?.token;
});

describe("Cours categories Tests", () => {
  it("Can create a category", async () => {
    const response = await request({
      path: `/category`,
      method: "post",
      payload: bookCategoryFake.create,
      token,
    });

    expectSuccess(response, httpStatus.CREATED);
  });

  it("Can update category", async () => {
    const { category_id } = await bookCategoryFake.rawCreate();

    const response = await request({
      path: `/category/${category_id}`,
      method: "patch",
      payload: bookCategoryFake.update,
      token,
    });

    expectSuccess(response);
    expect(response.body.data.category.name).toBe(bookCategoryFake.update.name);
  });

  it("Can get category using tag id", async () => {
    const { category_id } = await bookCategoryFake.rawCreate();
    const response = await request(`/category/${category_id}`);

    expectSuccess(response);
  });

  it("Should find Many categories ", async () => {
    const response = await request(`/category`);
    const { data } = response.body;

    expectSuccess(response);
    expectStructureToBe(data, ["categories"]);
  });

  it("Disable category", async () => {
    const { category_id } = await bookCategoryFake.rawCreate();

    const response = await request({
      path: `/category/${category_id}`,
      method: "patch",
      payload: { active: false },
      token,
    });

    expect(response.body.data.category.active).toBeFalsy();
    expectSuccess(response);
  });
  it("Enable category", async () => {
    const { category_id } = await bookCategoryFake.rawCreate();

    const response = await request({
      path: `/category/${category_id}`,
      method: "patch",
      payload: { active: true },
      token,
    });

    expect(response.body.data.category.active).toBeTruthy();
    expectSuccess(response);
  });

  it("Can find category parents(nested)", async () => {
    const { category_id: d1 } = await bookCategoryFake.rawCreate();
    const { category_id: d2 } = await bookCategoryFake.rawCreate({
      parent_id: d1,
    });
    const { category_id: d3 } = await bookCategoryFake.rawCreate({
      parent_id: d2,
    });
    const { category_id: d4 } = await bookCategoryFake.rawCreate({
      parent_id: d3,
    });
    const { category_id: d5 } = await bookCategoryFake.rawCreate({
      parent_id: d4,
    });
    const { category_id: d6 } = await bookCategoryFake.rawCreate({
      parent_id: d5,
    });

    const response = await request(`/category/parents?category_id=${d6}`);

    expect(response.body.data.categories.length).toBe(6);
    expectSuccess(response);
  });

  it("Can find category children(nested)", async () => {
    const { category_id: d1 } = await bookCategoryFake.rawCreate();
    const { category_id: d2 } = await bookCategoryFake.rawCreate({
      parent_id: d1,
    });
    const { category_id: d3 } = await bookCategoryFake.rawCreate({
      parent_id: d2,
    });
    const { category_id: d4 } = await bookCategoryFake.rawCreate({
      parent_id: d3,
    });
    const { category_id: d5 } = await bookCategoryFake.rawCreate({
      parent_id: d4,
    });
    const { category_id: d6 } = await bookCategoryFake.rawCreate({
      parent_id: d5,
    });

    const response = await request(`/category/children?category_id=${d1}`);

    expect(response.body.data.categories.length).toBe(6);
    expectSuccess(response);
  });
});
