import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import wishlistService from "./service";

const create = async (req: Request, res: Response) => {
  const result = await wishlistService.create(req);
  SuccessResponse.ok(res, { wishlist: result });
};
const findAllForUser = async (req: Request, res: Response) => {
  const result = await wishlistService.findAllForUser(req);
  SuccessResponse.ok(res, { wishlists: result });
};

export default { create, findAllForUser };
