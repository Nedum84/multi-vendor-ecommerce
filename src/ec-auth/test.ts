import { CREATED } from "http-status";
import { customRequest } from "../ec-test-utils/custom.request";
import { expectSuccess } from "../ec-test-utils/utils";
import userFake from "../ec-user/user.fake";

describe("Auth(Reg,Login,Logout) Tests", () => {
  it("Can create a user", async () => {
    const response = await customRequest({
      path: `/auth`,
      method: "post",
      payload: userFake.create(),
    });

    expectSuccess(response, CREATED);
  });

  it("Can login a user", async () => {
    const create = userFake.create();
    //Reg User
    await customRequest({ path: `/auth`, method: "post", payload: create });

    const response = await customRequest({
      path: `/auth/login`,
      method: "post",
      payload: { password: create.password, email: create.email },
    });

    expectSuccess(response);
    expect(response.body.data.tokens).not.toBeNull();
  });

  it("Can refresh users tokens", async () => {
    //Reg User
    const { body } = await customRequest({
      path: `/auth`,
      method: "post",
      payload: userFake.create(),
    });

    const { tokens } = body.data;

    const response = await customRequest({
      path: `/auth/refresh-token`,
      method: "post",
      payload: { refresh_token: tokens.refresh.token },
    });

    expectSuccess(response);
    expect(response.body.data.tokens).toBeDefined();
  });
  it("Can log a user out", async () => {
    //Reg User
    const { body } = await customRequest({
      path: `/auth`,
      method: "post",
      payload: userFake.create(),
    });

    const { tokens } = body.data;

    const response = await customRequest({
      path: `/auth/logout`,
      method: "post",
      payload: { refresh_token: tokens.refresh.token },
    });

    expectSuccess(response);
  });
});
