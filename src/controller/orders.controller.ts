import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import ordersService from "../services/orders.service";

const create = async (req: Request, res: Response) => {
  const result = await ordersService.create(req);
  ApiResponse.created(res, { order: result });
};
const updatePayment = async (req: Request, res: Response) => {
  const result = await ordersService.updatePayment(req);
  ApiResponse.ok(res, { order: result });
};
const adminUpdatePayment = async (req: Request, res: Response) => {
  const result = await ordersService.adminUpdatePayment(req);
  ApiResponse.ok(res, { order: result });
};
const updateOrderStatus = async (req: Request, res: Response) => {
  const result = await ordersService.updateOrderStatus(req);
  ApiResponse.ok(res, { sub_order: result });
};
const updateDeliveryStatus = async (req: Request, res: Response) => {
  const result = await ordersService.updateDeliveryStatus(req);
  ApiResponse.ok(res, { sub_order: result });
};
const userCancelOrder = async (req: Request, res: Response) => {
  const result = await ordersService.userCancelOrder(req);
  ApiResponse.ok(res, { sub_order: result });
};
const processRefund = async (req: Request, res: Response) => {
  const result = await ordersService.processRefund(req);
  ApiResponse.ok(res, { sub_order: result });
};
const settleStore = async (req: Request, res: Response) => {
  const result = await ordersService.settleStore(req);
  ApiResponse.ok(res, { settlement: result });
};
const storeUnsettledOrders = async (req: Request, res: Response) => {
  const result = await ordersService.storeUnsettledOrders(req);
  ApiResponse.ok(res, { sub_orders: result });
};
const findById = async (req: Request, res: Response) => {
  const { order_id } = req.params;
  const result = await ordersService.findById(order_id);
  ApiResponse.ok(res, { order: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await ordersService.findAll(req);
  ApiResponse.ok(res, { orders: result });
};

export default {
  create,
  updatePayment,
  adminUpdatePayment,
  storeUnsettledOrders,
  userCancelOrder,
  processRefund,
  updateOrderStatus,
  updateDeliveryStatus,
  settleStore,
  findById,
  findAll,
};
