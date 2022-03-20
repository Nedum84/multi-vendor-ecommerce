import { Request, Response } from "express";
import { signin } from "./utils/signin";
import productFake from "../test/factories/product.fake";
import productService from "../src/services/product.service";
import { ApiResponse } from "../src/apiresponse/api.response";

export const productVariables = async (req: Request, res: Response) => {
  req.user = await signin(req);

  const variables = await processVariables(req);
  ApiResponse.ok(res, variables);
};

const processVariables = async (req: Request) => {
  req.body = await productFake.create();
  const { product_id, variations } = await productService.create(req);

  return {
    product_id,
    variation_id: variations[0].variation_id,
  };
};
