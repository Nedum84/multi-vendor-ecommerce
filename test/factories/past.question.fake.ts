import userFake from "./user.fake";
import faker from "faker";
import { UserAddress } from "../../src/models";
import { generateChars } from "../../src/utils/random.string";

export default {
  rawCreate: async function (props?: any) {
    const { user_id } = await userFake.rawCreate();
    const data = {
      ...this.create,
      user_id,
      address_id: generateChars(),
      ...props,
    };
    return UserAddress.create(data);
  },
  create: {
    name: faker.random.words(3),
    email: faker.random.words(1),
    phone: faker.random.words(1),
    address: faker.random.words(3),
    city: faker.random.words(1),
    state: faker.random.words(1),
    country: faker.random.words(1),
    zip_code: faker.random.words(1),
    is_default: false,
  },
  update: {
    name: faker.random.words(3),
    email: faker.random.words(1),
    phone: faker.random.words(1),
    address: faker.random.words(3),
    city: faker.random.words(1),
    state: faker.random.words(1),
    country: faker.random.words(1),
    zip_code: faker.random.words(1),
    is_default: false,
  },
};
