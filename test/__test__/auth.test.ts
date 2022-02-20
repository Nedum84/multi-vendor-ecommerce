import { CREATED } from "http-status";
import userFake from "../factories/user.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Auth(Reg,Login,Logout) Tests", () => {
  it("Can create a user", async () => {
    const response = await request({
      path: `/auth`,
      method: "post",
      payload: userFake.create(),
    });

    expectSuccess(response, CREATED);
  });

  it("Can login a user", async () => {
    const create = userFake.create();
    //Reg User
    await request({ path: `/auth`, method: "post", payload: create });

    const response = await request({
      path: `/auth/login`,
      method: "post",
      payload: { password: create.password, email: create.email },
    });

    expectSuccess(response);
    expect(response.body.data.tokens).not.toBeNull();
  });

  it("Can refresh users tokens", async () => {
    //Reg User
    const { body } = await request({ path: `/auth`, method: "post", payload: userFake.create() });

    const { tokens } = body.data;

    const response = await request({
      path: `/auth/refresh-token`,
      method: "post",
      payload: { refresh_token: tokens.refresh.token },
    });

    expectSuccess(response);
    expect(response.body.data.tokens).toBeDefined();
  });
  it("Can log a user out", async () => {
    //Reg User
    const { body } = await request({
      path: `/auth`,
      method: "post",
      payload: userFake.create(),
    });

    const { tokens } = body.data;

    const response = await request({
      path: `/auth/logout`,
      method: "post",
      payload: { refresh_token: tokens.refresh.token },
    });

    expectSuccess(response);
  });
});
