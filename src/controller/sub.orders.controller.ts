import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import subOrdersService from "../services/sub.orders.service";

const findById = async (req: Request, res: Response) => {
  const { sub_order_id } = req.params;

  const result = await subOrdersService.findById(sub_order_id);
  ApiResponse.ok(res, { sub_order: result });
};
const findAllByOrderId = async (req: Request, res: Response) => {
  const { order_id } = req.params;

  const result = await subOrdersService.findAllByOrderId(order_id);
  ApiResponse.ok(res, { sub_orders: result });
};

export default {
  findById,
  findAllByOrderId,
};
