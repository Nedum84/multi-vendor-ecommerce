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
export enum PaymentStatus {
  FAILED = "failed",
  PENDING = "pending",
  COMPLETED = "completed",
}
export enum PaymentChannel {
  PAYSTACK = "paystack",
  SQUAD = "squad",
  FLW = "flutterwave",
  REFUND = "refund",
}
export enum FundingTypes { //For wallet
  REFUND = "refund",
  PAYMENT = "payment",
  REG_BONUS = "reg_bonus",
  REDEEM_CREDIT = "redeem_credit", //use a code to claim a bonus
}
