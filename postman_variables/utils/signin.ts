import { Request } from "express";
import { UserRoleStatus } from "../../src/enum/user.enum";
import userService from "../../src/services/user.service";
import userFake from "../../test/factories/user.fake";

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
