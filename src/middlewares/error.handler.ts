import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AggregateError, ValidationError } from "sequelize";
import { CustomError } from "../apiresponse/custom.error";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ status: err.statusCode, success: false, message: err.message });
  }

  const status = httpStatus.BAD_REQUEST;

  if (err instanceof ValidationError || err instanceof AggregateError) {
    const errMsg1 = err?.errors?.[0]?.message;
    //@ts-ignore
    const errMsg2 = err.errors?.[0]?.errors?.errors?.[0]?.message;
    if (errMsg1) {
      err.message = errMsg1;
    } else if (errMsg2) {
      err.message = errMsg2;
    }
  }

  console.error(err);
  res.status(status).send({
    status,
    success: false,
    message: err.message ?? "Something went wrong.",
    stack: err.stack ?? "",
  });
};
