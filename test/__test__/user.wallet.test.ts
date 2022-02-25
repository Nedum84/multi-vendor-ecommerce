import { CREATED } from "http-status";
import { generateChars } from "../../src/utils/random.string";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Wallet Tests...", () => {
  it("Admin Can fund user wallet", async () => {
    const { user } = await global.signin();

    const amount = 1200;
    const response = await request({
      path: `/wallet/admin-credit`,
      method: "post",
      payload: {
        user_id: user.user_id,
        amount,
      },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.credit.amount).toBe(amount);
  });

  it("Can fund my wallet", async () => {
    const payment_reference = generateChars(16);
    const response = await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 1200,
        payment_reference,
      },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.credit.payment_reference).toBe(payment_reference);
  });

  it("Can get wallet balance", async () => {
    const { tokens } = await global.signin();

    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: { amount: 2300, payment_reference: generateChars(16) },
      token: tokens.access.token,
    });
    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: { amount: 8400, payment_reference: generateChars(16) },
      token: tokens.access.token,
    });

    const response = await request({ path: `/wallet`, token: tokens.access.token });

    expectSuccess(response);
    expect(response.body.data.balance).toBeGreaterThan(0);
    expect(response.body.data.balance).toBe(2300 + 8400); //two payload amounts
  });

  it("Can get wallet history", async () => {
    const { tokens } = await global.signin();

    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: { amount: 2300, payment_reference: generateChars(16) },
      token: tokens.access.token,
    });
    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: { amount: 8400, payment_reference: generateChars(16) },
      token: tokens.access.token,
    });
    const response = await request({ path: `/wallet/history`, token: tokens.access.token });

    expectSuccess(response);
    expect(response.body.data.history.length).toBeGreaterThan(0);
  });
});
