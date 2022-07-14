import { generateChars } from "../ec-utils/random.string";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";
import { PaymentChannel } from "./types";

describe("Topup Tests...", () => {
  it("User can topup wallet", async () => {
    const amount = 1200;
    const response = await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    expectSuccess(response);
    expect(response.body.data.topup.amount).toBe(amount);
  });

  it("Can find topup by id", async () => {
    const payment_reference = generateChars(16);
    const amount = 1200;

    // create topup
    const { body } = await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        transaction_fee: 0,
        payment_reference,
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    const { topup_id } = body.data.topup;

    const response = await customRequest(`/topup/${topup_id}`);

    expectSuccess(response);
    expect(response.body.data.topup.payment_reference).toBe(payment_reference);
  });

  it("User can find all his topup history", async () => {
    const { tokens } = await global.signin();
    const paymentReference1 = generateChars(16);
    const paymentReference2 = generateChars(16);
    const amount = 1200;

    // create topup
    await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        payment_reference: paymentReference1,
        payment_channel: PaymentChannel.FLW,
        amount,
      },
      token: tokens.access.token,
    });
    await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        payment_reference: paymentReference2,
        payment_channel: PaymentChannel.FLW,
        amount,
      },
      token: tokens.access.token,
    });

    const response = await customRequest({
      path: `/topup/user`,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.total).toBe(2);
  });

  it("Admin can find user's topups", async () => {
    const paymentReference1 = generateChars(16);
    const paymentReference2 = generateChars(16);
    const amount = 1200;

    // create topup
    await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        payment_reference: paymentReference1,
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });
    await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        payment_reference: paymentReference2,
        payment_channel: PaymentChannel.FLW,
        amount,
      },
    });

    const response = await customRequest(`/topup/admin`);

    expectSuccess(response);
    expect(response.body.data.topups.length).toBeGreaterThan(0);
  });
});
