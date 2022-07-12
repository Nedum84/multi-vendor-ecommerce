import { Request } from "express";
import { UserRoleStatus } from "../src/ec-user/types";
import userService from "../src/ec-user/service";
import userFake from "../src/ec-user/test.faker";

//Register & signin user
export const signin = async (req: Request) => {
  req.body = { ...userFake.create(), role: UserRoleStatus.ADMIN1 };
  const user = await userService.create(req.body);

  return {
    role: user.role,
    user_id: user.user_id,
    stores: [],
  };
};
