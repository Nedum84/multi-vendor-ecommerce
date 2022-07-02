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
