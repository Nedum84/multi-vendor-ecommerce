import { BAD_REQUEST } from "http-status";
import { CustomError } from "./custom.error";

export class BadRequestError extends CustomError {
  constructor(
    public message: string,
    public errorCode = "BAD_REQUEST_ERROR",
    public statusCode: number = BAD_REQUEST,
    stack?: any
  ) {
    super(message);
    this.errorCode = errorCode;
    this.stack = stack ?? this.stack;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
