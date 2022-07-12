import { CREATED } from "http-status";
import userAddressFake from "./test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("User Address Test...", () => {
  it("Can create address", async () => {
    const payload = userAddressFake.update;
    const response = await customRequest({
      path: `/user-address`,
      method: "post",
      payload,
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.address.name).toBe(payload.name);
  });

  it("Can update address", async () => {
    const { user, tokens } = await global.signin();
    const { address_id } = await userAddressFake.rawCreate({ user_id: user.user_id });

    const payload = userAddressFake.update;
    const response = await customRequest({
      path: `/user-address/${address_id}`,
      method: "patch",
      payload,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.address.name).toBe(payload.name);
  });
  it("Can find address by id", async () => {
    const { address_id } = await userAddressFake.rawCreate();

    const response = await customRequest(`/user-address/${address_id}`);

    expectSuccess(response);
  });
  it("Can find all addresses", async () => {
    const { user, tokens } = await global.signin();
    await userAddressFake.rawCreate({ user_id: user.user_id });
    await userAddressFake.rawCreate({ user_id: user.user_id });
    await userAddressFake.rawCreate({ user_id: user.user_id });

    const response = await customRequest({ path: `/user-address`, token: tokens.access.token });

    expectSuccess(response);
    expect(response.body.data.addresses.length).not.toBe(0);
  });
});
