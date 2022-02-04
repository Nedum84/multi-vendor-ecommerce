import httpStatus from "http-status";
import { CustomError } from "./custom.error";

export class ErrorResponse extends CustomError {
  constructor(
    public message: string,
    public statusCode: number = httpStatus.BAD_REQUEST,
    public stack = ""
  ) {
    super(message);
    this.stack = stack;

    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }
}
