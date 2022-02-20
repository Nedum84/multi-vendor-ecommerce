import faker from "faker";
import { UserRoleStatus } from "../../src/enum/user.enum";
import { User } from "../../src/models";
import { generateChars } from "../../src/utils/random.string";
import { UserUtils } from "../../src/utils/user.utils";

export default {
  rawCreate: async function (props?: any) {
    const body = this.create();
    const data = {
      ...body,
      user_id: generateChars(),
      password: await UserUtils.hashPassword(body.password),
      ...props,
    };
    return User.create(data);
  },
  create: function () {
    return {
      name: faker.name.firstName() + " " + faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
    };
  },
  update: {
    name: faker.name.firstName() + " " + faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
    email: faker.internet.email(),
    photo: faker.internet.avatar(),
  },
  adminUpdate: {
    name: faker.name.firstName() + " " + faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
    email: faker.internet.email(),
    photo: faker.internet.avatar(),
    role: UserRoleStatus.ADMIN1,
    suspended: false,
  },
};
