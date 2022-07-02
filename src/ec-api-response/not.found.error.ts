import httpStatus from "http-status";
import { CustomError } from "./custom.error";

export class NotFoundError extends CustomError {
  statusCode = httpStatus.NOT_FOUND;

  constructor(public message: string = "Not found", public errorCode = "NOT_FOUND_ERROR") {
    super(message);

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
