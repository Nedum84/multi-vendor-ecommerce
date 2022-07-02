import { Request, Response, NextFunction } from "express";
import { verify, VerifyErrors } from "jsonwebtoken";
import moment from "moment";
import config from "../ec-config/config";
import { UserRoleStatus } from "../ec-user/types";
import { UnauthorizedError } from "../ec-api-response/unauthorized.error";

export interface UserPayload {
  user_id: string;
  stores: string[];
  role: UserRoleStatus;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    throw new UnauthorizedError("Unauthorized", "ERROR_INVALID_TOKEN");
  }

  verify(token, config.jwt.secret, (err: VerifyErrors | null, data: any) => {
    let dateNow = moment().unix();
    let exp = data?.exp;

    if (err || dateNow > exp) {
      throw new UnauthorizedError(err?.message ?? "Unauthorized", "ERROR_INVALID_TOKEN");
    }

    req.user = data.user;
    next();
  });
};
