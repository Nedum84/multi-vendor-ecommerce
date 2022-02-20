import httpStatus from "http-status";
import { CustomError } from "./custom.error";

export class NotFoundError extends CustomError {
  statusCode = httpStatus.NOT_FOUND;

  constructor(public message: string = "Not found", public stack?: string) {
    super(message);
    this.stack = stack;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
