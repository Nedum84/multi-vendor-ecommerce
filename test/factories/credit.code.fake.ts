import faker from "faker";
import { generateChars } from "../../src/utils/random.string";
import { CreditCode, CreditCodeUser } from "../../src/models";
import userFake from "./user.fake";
import { CreditCodeType } from "../../src/enum/credit.code.enum";

export default {
  rawCreate: async function (props?: any) {
    const create = await this.userCreate();
    const { user_id: created_by } = await userFake.rawCreate();
    const credit_code = generateChars(32);

    const data = {
      ...create,
      credit_code,
      created_by,
      ...props,
    };

    const creditCode = await CreditCode.create(data);

    const payload = create.users.map(({ user_id }: { user_id: any }) => ({
      user_id,
      credit_code,
    }));
    await CreditCodeUser.bulkCreate(payload);
    return creditCode;
  },
  create: function () {
    return {
      title: faker.random.words(4),
      amount: 12098,
      start_date: new Date(),
      end_date: new Date(Date.now() + 48 * 3600), //next 2 days
      usage_limit: 20,
    };
  },
  userCreate: async function (props?: any) {
    const { user_id: u1 } = await userFake.rawCreate();
    const { user_id: u2 } = await userFake.rawCreate();

    return {
      ...this.create(),
      credit_type: CreditCodeType.USER,
      users: [{ user_id: u1 }, { user_id: u2 }],
      ...props,
    };
  },
  allCreate: async function (props?: any) {
    return {
      ...this.create(),
      credit_type: CreditCodeType.ALL,
      ...props,
    };
  },
};
