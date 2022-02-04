import httpStatus from "http-status";
import { CustomError } from "./custom.error";

export class UnauthorizedError extends CustomError {
  statusCode = httpStatus.UNAUTHORIZED;

  constructor(
    public message = "Unauthorized for this action",
    public stack?: string
  ) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
