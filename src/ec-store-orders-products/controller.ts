import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import storeOrdersProductService from "./service";

const findAllBySubOrderId = async (req: Request, res: Response) => {
  const { store_order_id } = req.params;

  const result = await storeOrdersProductService.findAllBySubOrderId(store_order_id);
  SuccessResponse.ok(res, { order_products: result });
};

export default {
  findAllBySubOrderId,
};
