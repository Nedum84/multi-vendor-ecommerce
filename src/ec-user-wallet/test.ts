import { generateChars } from "../ec-utils/random.string";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest } from "../ec-test-utils/custom.request";
import { PaymentChannel } from "../ec-topup/types";

describe("User Wallet Tests...", () => {
  it("User can find balance", async () => {
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
      path: `/wallet/balance`,
      token: tokens.access.token,
    });

    expectSuccess(response);
    expect(response.body.data.balance).toBe(amount);
  });
});
