import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import subOrdersProductService from "../services/sub.orders.product.service";

const findAllBySubOrderId = async (req: Request, res: Response) => {
  const { sub_order_id } = req.params;

  const result = await subOrdersProductService.findAllBySubOrderId(sub_order_id);
  ApiResponse.ok(res, { sub_products: result });
};

export default {
  findAllBySubOrderId,
};
