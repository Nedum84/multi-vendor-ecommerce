import { CREATED } from "http-status";
import { FundingTypes, PaymentChannel } from "../../src/enum/payment.enum";
import { generateChars } from "../../src/utils/random.string";
import creditCodeFake from "../factories/credit.code.fake";
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
        channel: PaymentChannel.FLW,
      },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.credit.payment_reference).toBe(payment_reference);
  });

  it("User can redeem credit code", async () => {
    const { user, tokens } = await global.signin();
    const users = [{ user_id: user.user_id }];
    const { credit_code } = await creditCodeFake.rawCreate({ users });

    const response = await request({
      path: `/wallet/redeem-credit`,
      method: "post",
      payload: { credit_code },
      token: tokens.access.token,
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.credit.credit_code).toBe(credit_code);
    expect(response.body.data.credit.fund_type).toBe(FundingTypes.REDEEM_CREDIT);
  });

  it("Can get wallet balance", async () => {
    const { tokens } = await global.signin();

    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 2300,
        payment_reference: generateChars(16),
        channel: PaymentChannel.SQUAD,
      },
      token: tokens.access.token,
    });
    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 8400,
        payment_reference: generateChars(16),
        channel: PaymentChannel.PAYSTACK,
      },
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
      payload: {
        amount: 2300,
        payment_reference: generateChars(16),
        channel: PaymentChannel.SQUAD,
      },
      token: tokens.access.token,
    });
    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 8400,
        payment_reference: generateChars(16),
        channel: PaymentChannel.FLW,
      },
      token: tokens.access.token,
    });
    const response = await request({ path: `/wallet/history`, token: tokens.access.token });

    expectSuccess(response);
    expect(response.body.data.history.length).toBeGreaterThan(0);
  });

  //   TODO
  // --> Product rating
  // --> Related Product
  // --> Tags
  // --> Withdrawal
  // --> Update store rating dynamically

  it("Can get withdrawable balance ", async () => {
    const { user, tokens } = await global.signin();
    const { token } = tokens.access;
    const users = [{ user_id: user.user_id }];

    //Deposite #1
    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: { amount: 2300, payment_reference: generateChars(16), channel: PaymentChannel.SQUAD },
      token,
    });
    //Deposite #2
    await request({
      path: `/wallet/user-credit`,
      method: "post",
      payload: { amount: 8400, payment_reference: generateChars(16), channel: PaymentChannel.FLW },
      token,
    });
    //Credit
    const { credit_code, amount } = await creditCodeFake.rawCreate({ users });
    await request({ path: `/wallet/redeem-credit`, method: "post", payload: { credit_code }, token });

    const response = await request({ path: `/wallet/withdrawable`, token });

    expectSuccess(response);
    expect(response.body.data.withrawable_amount).toBeGreaterThan(0);
    expect(response.body.data.total_payment_by_topup).toBeGreaterThan(0);
    expect(response.body.data.total_bonus).toBeGreaterThan(0);
    expect(response.body.data.total_bonus).toBe(amount);
  });
});
