import { CREATED, OK } from "http-status";
import { CreditCodeType } from "../../src/enum/credit.code.enum";
import CreditCodeUtils from "../../src/utils/credit.utils";
import { generateChars } from "../../src/utils/random.string";
import creditCodeFake from "../factories/credit.code.fake";
import { expectError, expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Credit Code Tests", () => {
  it("Can create user credit code", async () => {
    const credit_code = generateChars();

    const payload = await creditCodeFake.userCreate();
    const response = await request({
      path: `/credit`,
      method: "post",
      payload: { ...payload, credit_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.credit_code.users.length).toBeGreaterThan(0);
  });

  it("Can create all users credit code", async () => {
    const credit_code = generateChars();

    const payload = await creditCodeFake.allCreate();
    const response = await request({
      path: `/credit`,
      method: "post",
      payload: { ...payload, credit_code },
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.credit_code.users.length).toBe(0);
  });

  it("Can generate credit_code code", async () => {
    const response = await request({
      path: `/credit/generate`,
      method: "post",
    });

    expectSuccess(response, OK);
    expect(response.body.data.credit_code).toBeDefined();
  });

  it("Can revoke credit_code", async () => {
    const credit_code = generateChars();

    const payload = await creditCodeFake.userCreate();
    await request({
      path: `/credit`,
      method: "post",
      payload: { ...payload, credit_code },
    });

    const response = await request({
      path: `/credit/revoke`,
      method: "post",
      payload: { credit_code },
    });

    expectSuccess(response);
    expect(response.body.data.credit_code.revoke).toBeTruthy();
  });

  it("Can check if credit_code exist", async () => {
    const credit_code1 = await CreditCodeUtils.generateCreditCode();
    const credit_code2 = await CreditCodeUtils.generateCreditCode();
    const payload = await creditCodeFake.allCreate();

    await request({
      path: `/credit`,
      method: "post",
      payload: { ...payload, credit_code: credit_code1 },
    });
    const notExistResponse = await request({
      path: `/credit/check-exist`,
      method: "post",
      payload: { credit_code: credit_code1 },
    });
    const creditCodeExistResponse = await request({
      path: `/credit/check-exist`,
      method: "post",
      payload: { credit_code: credit_code2 },
    });

    expectSuccess(creditCodeExistResponse);
    expectError(notExistResponse);
  });

  it("Can find credit by credit_code", async () => {
    const { credit_code } = await creditCodeFake.rawCreate();

    const response = await request(`/credit/${credit_code}`);
    expectSuccess(response);
    expect(response.body.data.credit_code.credit_code).toBe(credit_code);
  });

  it("Can find all", async () => {
    const credit_code1 = generateChars(18);
    const credit_code2 = generateChars(19);

    const payload = await creditCodeFake.userCreate();
    await request({
      path: `/credit`,
      method: "post",
      payload: { ...payload, credit_code: credit_code1 },
    });
    await request({
      path: `/credit`,
      method: "post",
      payload: { ...payload, credit_code: credit_code2 },
    });

    const response = await request(`/credit?credit_type=${CreditCodeType.USER}&search_query=${payload.title}`);

    expectSuccess(response);
    expect(response.body.data.credit_codes.length).not.toBe(0);
  });
});
