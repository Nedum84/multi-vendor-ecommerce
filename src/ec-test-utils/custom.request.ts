import { app } from "../app";
import request, { Response } from "supertest";

interface RequestParams<T> {
  path: string;
  method?: "get" | "post" | "patch" | "delete";
  payload?: Partial<T>;
  token?: string;
}

export const testBaseUrl = "/api/v1";

//Wrapper around supertest request
export const customRequest = async <T = object>(
  params: RequestParams<T> | string
): Promise<Response> => {
  if (typeof params == "string") {
    //--> GET
    const { tokens } = await global.signin();
    return request(app)
      .get(`${testBaseUrl}${params}`)
      .set("authorization", `bearer ${tokens?.access?.token}`);
  }

  //Continue...
  const { path, method = "get", payload = {} } = params;
  let token = params.token;
  if (!params.token) {
    const { tokens } = await global.signin();
    token = tokens?.access?.token;
  }

  const bearerToken = `bearer ${token}`;
  if (method == "post")
    return request(app)
      .post(`${testBaseUrl}${path}`)
      .send(payload)
      .set("authorization", bearerToken);
  if (method == "patch")
    return request(app)
      .patch(`${testBaseUrl}${path}`)
      .send(payload)
      .set("authorization", bearerToken);
  if (method == "delete")
    return request(app)
      .delete(`${testBaseUrl}${path}`)
      .send(payload)
      .set("authorization", bearerToken);

  //--> GET
  return request(app).get(`${testBaseUrl}${path}`).set("authorization", bearerToken);
};
