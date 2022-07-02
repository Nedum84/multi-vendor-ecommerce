import { ValidationError } from "joi";
import { CustomError } from "./custom.error";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public error: ValidationError, public errorCode = "VALIDATION_ERROR") {
    super(error.message ?? "Invalid request parameters");
    this.errors = this.error.details.map((err) => {
      return { message: err.message, field: err.context?.key }; // 'key' or 'label' gives the {{ field }}
    });

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}
