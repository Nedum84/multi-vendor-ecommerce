import userFake from "../factories/user.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("User Tests...", () => {
  it("Can update my profile", async () => {
    const { tokens } = await global.signin();

    const payload = userFake.update;
    const response = await request({
      path: `/user/me`,
      method: "patch",
      payload,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.user.email).toBe(payload.email);
  });

  it("Admin can update a user", async () => {});

  it("Can update password", async () => {});
});
