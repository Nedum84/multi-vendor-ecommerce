import { CREATED } from "http-status";
import { FundingTypes, PaymentChannel } from "../ec-orders/payment.enum";
import { generateChars } from "../ec-utils/random.string";
import creditCodeFake from "../ec-credit-code/credit.code.fake";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";

describe("Wallet Tests...", () => {
  it("Admin Can fund user wallet", async () => {
    const { user } = await global.signin();

    const amount = 1200;
    const response = await customRequest({
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
    const response = await customRequest({
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

    const response = await customRequest({
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

    await customRequest({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 2300,
        payment_reference: generateChars(16),
        channel: PaymentChannel.SQUAD,
      },
      token: tokens.access.token,
    });
    await customRequest({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 8400,
        payment_reference: generateChars(16),
        channel: PaymentChannel.PAYSTACK,
      },
      token: tokens.access.token,
    });

    const response = await customRequest({ path: `/wallet`, token: tokens.access.token });

    expectSuccess(response);
    expect(response.body.data.balance).toBeGreaterThan(0);
    expect(response.body.data.balance).toBe(2300 + 8400); //two payload amounts
  });

  it("Can get wallet history", async () => {
    const { tokens } = await global.signin();

    await customRequest({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 2300,
        payment_reference: generateChars(16),
        channel: PaymentChannel.SQUAD,
      },
      token: tokens.access.token,
    });
    await customRequest({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 8400,
        payment_reference: generateChars(16),
        channel: PaymentChannel.FLW,
      },
      token: tokens.access.token,
    });
    const response = await customRequest({ path: `/wallet/history`, token: tokens.access.token });

    expectSuccess(response);
    expect(response.body.data.history.length).toBeGreaterThan(0);
  });

  it("Can get withdrawable balance ", async () => {
    const { user, tokens } = await global.signin();
    const { token } = tokens.access;
    const users = [{ user_id: user.user_id }];

    //Deposite #1
    await customRequest({
      path: `/wallet/user-credit`,
      method: "post",
      payload: {
        amount: 2300,
        payment_reference: generateChars(16),
        channel: PaymentChannel.SQUAD,
      },
      token,
    });
    //Deposite #2
    await customRequest({
      path: `/wallet/user-credit`,
      method: "post",
      payload: { amount: 8400, payment_reference: generateChars(16), channel: PaymentChannel.FLW },
      token,
    });
    //Credit
    const { credit_code, amount } = await creditCodeFake.rawCreate({ users });
    await customRequest({
      path: `/wallet/redeem-credit`,
      method: "post",
      payload: { credit_code },
      token,
    });

    const response = await customRequest({ path: `/wallet/withdrawable`, token });

    expectSuccess(response);
    expect(response.body.data.withrawable_amount).toBeGreaterThan(0);
    expect(response.body.data.total_payment_by_topup).toBeGreaterThan(0);
    expect(response.body.data.total_bonus).toBeGreaterThan(0);
    expect(response.body.data.total_bonus).toBe(amount);
  });
});
