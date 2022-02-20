import sequelize from "../src/models";
import userFake from "./factories/user.fake";
import request, { Response } from "supertest";
import { app } from "../src/app";
import { UserAttributes } from "../src/models/user.model";
import { UserRoleStatus } from "../src/enum/user.enum";
import tokenService from "../src/services/token.service";

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
interface RequestParams {
  path: string;
  method?: "get" | "post" | "patch" | "delete";
  payload?: object;
  token?: string;
}
declare global {
  var signin: (props?: object) => Promise<SignInData>;
  var buildRequest: (request: RequestParams | string) => Promise<Response>;
}

jest.setTimeout(20000);

const baseUrl = "/api/v1";

beforeAll(async () => {
  await sequelize
    .sync({ force: true })
    .catch((e) => console.log(e))
    .then((r) => console.log("connected"));
  // await sequelize.sync({ force: true });
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

//Wrapper around supertest request
global.buildRequest = async (params: RequestParams | string) => {
  if (typeof params == "string") {
    //--> GET
    const { tokens } = await global.signin();
    return request(app).get(`${baseUrl}${params}`).set("authorization", `bearer ${tokens?.access?.token}`);
  }

  //Continue...
  const { path, method = "get", payload = {} } = params;
  let token = params.token;
  if (!params.token) {
    const { tokens } = await global.signin();
    token = tokens?.access?.token;
  }

  const bearerToken = `bearer ${token}`;
  if (method == "post") return request(app).post(`${baseUrl}${path}`).send(payload).set("authorization", bearerToken);
  if (method == "patch") return request(app).patch(`${baseUrl}${path}`).send(payload).set("authorization", bearerToken);
  if (method == "delete")
    return request(app).delete(`${baseUrl}${path}`).send(payload).set("authorization", bearerToken);

  //--> GET
  return request(app).get(`${baseUrl}${path}`).set("authorization", bearerToken);
};
