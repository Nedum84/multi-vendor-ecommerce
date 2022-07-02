import tokenService from "../ec-auth/token.service";
import sequelize from "../ec-models";
import { UserRoleStatus } from "../ec-user/types";
import userFake from "../ec-user/user.fake";
import { UserAttributes } from "../ec-user/user.model";

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

afterAll(async () => {
  await sequelize.close();
});

//props == > custom user attributes
global.signin = async (props: object = {}) => {
  const user = await userFake.rawCreate({ role: UserRoleStatus.ADMIN1, ...props });
  const tokens = await tokenService.generateAuthTokens(user, []);

  return { tokens, user };
};
