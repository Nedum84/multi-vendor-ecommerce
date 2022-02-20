import { OK, BAD_REQUEST } from "http-status";
import { Response } from "supertest";

const expectStructureToBe = (data: any, structure: any, map?: any) => {
  if (structure["*"]) {
    expect(data.length).toBeGreaterThan(0);
    data.forEach((item: any) => {
      expectStructureToBe(item, structure["*"], map);
    });
  } else {
    const values = typeof map === "function" ? map(data) : data;
    expect(Object.keys(values)).toEqual(structure);
  }
};

const expectSuccess = (response: Response, code = OK) => {
  expect(response.body.success).toBeTruthy();
  expect(response.status).toBe(code);
};

const expectError = (response: Response, code = BAD_REQUEST) => {
  expect(response.body.message).not.toBeNull();
  expect(response.body.success).toBeFalsy();
  expect(response.status).toBe(code);
};

const expectErrorMessage = (response: Response, message: string) => {
  expect(response.body.message).toBe(message);
  expect(response.body.success).toBeFalsy();
};

export { expectStructureToBe, expectSuccess, expectError, expectErrorMessage };
