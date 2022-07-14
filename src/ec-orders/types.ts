import { CouponInstance } from "../ec-coupon/model.coupon";

export enum OrderStatus {
  CANCELLED = "cancelled", //by user or the system(cron job)
  PENDING = "pending", // pending payment/approval
  COMPLETED = "completed", //approved but not delivered
}
export enum DeliveryStatus {
  NOT_APPROVED = "not_approved",
  APPROVED = "approved",
  PICKING = "picking",
  DELAY_PICKING = "delay_picking",
  PICKED = "picked",
  NOT_PICKED = "not_picked",
  DELIVERING = "delivering",
  DELIVERED = "delivered",
  NOT_DELIVERED = "not_delivered",
  AUDITED = "audited",
  CANCELLED = "cancelled",
}
