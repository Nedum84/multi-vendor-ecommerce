import httpStatus from "http-status";
import { Response } from "express";

export class SuccessResponse {
  static response = (
    res: Response,
    statusCode: number,
    payload?: Object,
    message?: string,
    extra = {}
  ) => {
    const success =
      statusCode === httpStatus.OK || statusCode === httpStatus.CREATED ? true : false;
    res.status(statusCode).send({
      status: statusCode,
      success,
      message,
      data: payload,
      ...extra,
    });
  };

  static ok = (res: Response, payload?: Object, message?: string) => {
    const msg = message ?? "success";
    const status: number = httpStatus.OK;
    return SuccessResponse.response(res, status, payload, msg);
  };

  static created = (res: Response, payload?: Object, message?: string) => {
    const msg = message ?? "success";
    const status: number = httpStatus.CREATED;
    return SuccessResponse.response(res, status, payload, msg);
  };

  static customError = (
    res: Response,
    statusCode?: number,
    message = "Error occured",
    stack?: any
  ) => {
    const status: number = statusCode ?? httpStatus.BAD_REQUEST;
    return SuccessResponse.response(res, status, "", message, stack);
  };
}
