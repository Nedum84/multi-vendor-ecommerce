export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract errorCode: string;
  public errors: any[]; //for request validation error {Joi validation}

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
