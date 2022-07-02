import httpStatus from "http-status";
import { CustomError } from "./custom.error";

export class ForbiddenError extends CustomError {
  statusCode = httpStatus.FORBIDDEN;

  constructor(
    public message = "You don't have enough permission to access this resource",
    public errorCode = "ACCESS_DENIED"
  ) {
    super(message);

    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
