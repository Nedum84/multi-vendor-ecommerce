import { UserRoleStatus } from "../../src/enum/user.enum";
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

  it("Admin can update a user", async () => {
    const { user_id } = await userFake.rawCreate({ role: UserRoleStatus.USER });
    const { tokens } = await global.signin();
    const payload = userFake.update;

    const response = await request({
      path: `/user/admin/${user_id}`,
      method: "patch",
      payload,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.user.phone).toBe(payload.phone);
  });

  it("Can update password", async () => {
    const create = userFake.create();
    const newPass = "Neluouw*72@";
    //Reg User
    const { body } = await request({ path: `/auth`, method: "post", payload: create });
    const { tokens } = body.data;

    const response = await request({
      path: `/user/password`,
      method: "patch",
      payload: { old_password: create.password, new_password: newPass },
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.user.name).toBeDefined();
  });

  it("Can find my detail", async () => {
    const response = await request(`/user/me`);

    expectSuccess(response);
  });

  it("Can find a user by ID", async () => {
    const { user_id } = await userFake.rawCreate();

    const response = await request(`/user/${user_id}`);

    expectSuccess(response);
  });

  it("Can find a user by email", async () => {
    const { email } = await userFake.rawCreate();

    const response = await request(`/user/email/${email}`);

    expectSuccess(response);
  });

  it("Can all users", async () => {
    const response = await request(`/user`);

    expectSuccess(response);
  });
});
