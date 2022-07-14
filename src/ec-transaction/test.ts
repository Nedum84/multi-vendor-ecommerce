import { Transaction } from "../ec-models";
import { generateChars } from "../ec-utils/random.string";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";
import { PaymentChannel } from "../ec-topup/types";

beforeAll(async () => {});

describe("Transaction Tests...", () => {
  it("User can check balance", async () => {
    const { tokens } = await global.signin();
    const amount = 1200;
    // topup
    await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        transaction_fee: 0,
        payment_reference: generateChars(25),
        payment_channel: PaymentChannel.FLW,
        amount,
      },
      token: tokens.access.token,
    });
    // check balance
    const response = await customRequest({
      path: `/transaction/balance`,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.balance).toBe(amount);
  });

  it("Can find by transaction id", async () => {
    const { tokens, user } = await global.signin();
    const paymentReference = generateChars(25);
    const amount = 1200;
    // topup
    await customRequest({
      path: `/topup`,
      method: "post",
      payload: {
        transaction_fee: 0,
        payment_reference: paymentReference,
        payment_channel: PaymentChannel.FLW,
        amount,
      },
      token: tokens.access.token,
    });

    const { transaction_id } = (await Transaction.findOne({ where: { user_id: user.user_id } }))!;
    // find by ID
    const response = await customRequest({
      path: `/transaction/${transaction_id}`,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.transaction.reference_id).toBe(paymentReference);
    expect(response.body.data.transaction.user_id).toBe(user.user_id);
    expect(response.body.data.transaction.transaction_id).toBe(transaction_id);
  });

  it("User can find all transaction history", async () => {
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
      path: `/transaction`,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.total).toBe(2);
  });

  it("Admin can find/filter transactions", async () => {
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

    const response = await customRequest(`/transaction/admin`);

    expectSuccess(response);
    expect(response.body.data.transactions.length).toBeGreaterThan(0);
  });
});
