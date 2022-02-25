import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import wishlistService from "../services/wishlist.service";

const create = async (req: Request, res: Response) => {
  const result = await wishlistService.create(req);
  ApiResponse.ok(res, { wishlist: result });
};
const findAllForUser = async (req: Request, res: Response) => {
  const result = await wishlistService.findAllForUser(req);
  ApiResponse.ok(res, { wishlists: result });
};

export default { create, findAllForUser };
