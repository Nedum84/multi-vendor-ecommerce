import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import storeOrdersProductService from "../services/store.orders.product.service";

const findAllBySubOrderId = async (req: Request, res: Response) => {
  const { sub_order_id } = req.params;

  const result = await storeOrdersProductService.findAllBySubOrderId(sub_order_id);
  ApiResponse.ok(res, { order_products: result });
};

export default {
  findAllBySubOrderId,
};
