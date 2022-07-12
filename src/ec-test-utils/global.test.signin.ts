import tokenService from "../ec-auth/service.token";
import sequelize from "../ec-models";
import { UserRoleStatus } from "../ec-user/types";
import userFake from "../ec-user/test.faker";
import { UserAttributes } from "../ec-user/model";

// THIS RUNS BEFORE each test File
// So, the number of times it runs equals the number of test files

interface SignInData {
  user: UserAttributes;
  tokens: {
    access: {
      token: string;
      expires: Date;
    };
    refresh: {
      token: string;
      expires: Date;
    };
  };
}
declare global {
  var signin: (props?: object) => Promise<SignInData>;
}

beforeAll(async () => {
  await sequelize
    .sync({ force: true })
    .catch((e) => console.log(e))
    .then((r) => console.log("db. connected"));
});

beforeEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await sequelize.close();
});

//props == > custom user attributes
global.signin = async (props: object = {}) => {
  const user = await userFake.rawCreate({ role: UserRoleStatus.ADMIN1, ...props });
  const tokens = await tokenService.generateAuthTokens(user, []);

  return { tokens, user };
};
