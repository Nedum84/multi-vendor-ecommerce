import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import storeOrdersService from "../services/store.orders.service";

const findById = async (req: Request, res: Response) => {
  const { sub_order_id } = req.params;

  const result = await storeOrdersService.findById(sub_order_id);
  ApiResponse.ok(res, { sub_order: result });
};
const findAllByOrderId = async (req: Request, res: Response) => {
  const { order_id } = req.params;

  const result = await storeOrdersService.findAllByOrderId(order_id);
  ApiResponse.ok(res, { store_orders: result });
};

export default {
  findById,
  findAllByOrderId,
};
