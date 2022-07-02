import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import storeOrdersService from "./store.orders.service";

const findById = async (req: Request, res: Response) => {
  const { store_order_id } = req.params;

  const result = await storeOrdersService.findById(store_order_id);
  SuccessResponse.ok(res, { sub_order: result });
};
const findAllByOrderId = async (req: Request, res: Response) => {
  const { order_id } = req.params;

  const result = await storeOrdersService.findAllByOrderId(order_id);
  SuccessResponse.ok(res, { store_orders: result });
};

export default {
  findById,
  findAllByOrderId,
};
