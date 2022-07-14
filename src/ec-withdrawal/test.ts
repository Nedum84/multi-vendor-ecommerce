import { generateChars } from "../ec-utils/random.string";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";
import { PaymentChannel } from "../ec-topup/types";

describe("Withdrawal Tests...", () => {
  it("User can withdraw from wallet", async () => {
    const amount = 1200;
    const { tokens } = await global.signin();

    // topup
    await customRequest({
      path: `/topup`,
      method: "post",
      token: tokens.access.token,
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    //withdrawal request
    const response = await customRequest({
      path: `/withdrawal`,
      method: "post",
      payload: { amount },
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.withdrawal.amount).toBe(amount);
    expect(response.body.data.withdrawal.user_amount).toBeLessThanOrEqual(amount);
    expect(response.body.data.withdrawal.processed).toBeFalsy();
    expect(response.body.data.withdrawal.is_declined).toBeFalsy();
  });

  it("Admin can process withdrawal", async () => {
    const amount = 1200;
    const { tokens } = await global.signin();

    // topup
    await customRequest({
      path: `/topup`,
      method: "post",
      token: tokens.access.token,
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    // withdrawal request
    const { body } = await customRequest({
      path: `/withdrawal`,
      method: "post",
      payload: { amount },
      token: tokens.access.token,
    });

    const { withdrawal_id } = body.data.withdrawal;
    const response = await customRequest({
      path: `/withdrawal/${withdrawal_id}/process`,
      method: "post",
    });

    expectSuccess(response);
    expect(response.body.data.withdrawal.processed).toBeTruthy();
    expect(response.body.data.withdrawal.is_declined).toBeFalsy();
  });

  it("Admin can decline withdrawal", async () => {
    const amount = 1200;
    const { tokens } = await global.signin();

    // topup
    await customRequest({
      path: `/topup`,
      method: "post",
      token: tokens.access.token,
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    // withdrawal request
    const { body } = await customRequest({
      path: `/withdrawal`,
      method: "post",
      payload: { amount },
      token: tokens.access.token,
    });

    const { withdrawal_id } = body.data.withdrawal;
    const response = await customRequest({
      path: `/withdrawal/${withdrawal_id}/decline`,
      method: "post",
      payload: { declined_reason: "Reason for declining oo" },
    });

    expectSuccess(response);
    expect(response.body.data.withdrawal.processed).toBeFalsy();
    expect(response.body.data.withdrawal.is_declined).toBeTruthy();
  });

  it("User can find withdrawal history", async () => {
    const amount = 1200;
    const { tokens } = await global.signin();

    // topup
    await customRequest({
      path: `/topup`,
      method: "post",
      token: tokens.access.token,
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    // withdrawal request
    await customRequest({
      path: `/withdrawal`,
      method: "post",
      payload: { amount },
      token: tokens.access.token,
    });

    const response = await customRequest({
      path: `/withdrawal`,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.withdrawals.length).toBeGreaterThan(0);
  });

  it("Admin can find all withdrawal history", async () => {
    const amount = 1200;
    const { tokens } = await global.signin();

    // topup
    await customRequest({
      path: `/topup`,
      method: "post",
      token: tokens.access.token,
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    // withdrawal request
    await customRequest({
      path: `/withdrawal`,
      method: "post",
      payload: { amount },
      token: tokens.access.token,
    });

    const response = await customRequest(`/withdrawal/admin`);

    expectSuccess(response);
    expect(response.body.data.withdrawals.length).toBeGreaterThan(0);
  });
});
