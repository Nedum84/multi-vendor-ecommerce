import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import ordersService from "./service";

const create = async (req: Request, res: Response) => {
  const result = await ordersService.create(req);
  SuccessResponse.created(res, { order: result });
};
const updatePayment = async (req: Request, res: Response) => {
  const result = await ordersService.updatePayment(req);
  SuccessResponse.ok(res, { order: result });
};
const adminUpdatePayment = async (req: Request, res: Response) => {
  const result = await ordersService.adminUpdatePayment(req);
  SuccessResponse.ok(res, { order: result });
};
const updateOrderStatus = async (req: Request, res: Response) => {
  const result = await ordersService.updateOrderStatus(req);
  SuccessResponse.ok(res, { sub_order: result });
};
const updateDeliveryStatus = async (req: Request, res: Response) => {
  const result = await ordersService.updateDeliveryStatus(req);
  SuccessResponse.ok(res, { sub_order: result });
};
const userCancelOrder = async (req: Request, res: Response) => {
  const result = await ordersService.userCancelOrder(req);
  SuccessResponse.ok(res, { sub_order: result });
};
const processRefund = async (req: Request, res: Response) => {
  const result = await ordersService.processRefund(req);
  SuccessResponse.ok(res, { sub_order: result });
};
const settleStore = async (req: Request, res: Response) => {
  const result = await ordersService.settleStore(req);
  SuccessResponse.ok(res, { settlement: result });
};
const storeUnsettledOrders = async (req: Request, res: Response) => {
  const result = await ordersService.storeUnsettledOrders(req);
  SuccessResponse.ok(res, { store_orders: result });
};
const findById = async (req: Request, res: Response) => {
  const { order_id } = req.params;
  const result = await ordersService.findById(order_id);
  SuccessResponse.ok(res, { order: result });
};
const findAll = async (req: Request, res: Response) => {
  const result = await ordersService.findAll(req);
  SuccessResponse.ok(res, { orders: result });
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
