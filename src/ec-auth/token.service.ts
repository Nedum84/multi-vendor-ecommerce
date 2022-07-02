import jwt from "jsonwebtoken";
import config from "../ec-config/config";
import moment from "moment";
import httpStatus from "http-status";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { UserAttributes } from "../ec-user/user.model";
import userService from "../ec-user/user.service";
import { TokenTypes } from "./types";
import sequelize, { Token } from "../ec-models";
import storeService from "../ec-store/store.service";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { Transaction } from "sequelize";

/**
 * Generate token
 * @param {Object} data
 * @param {Moment} expires
 * @returns {string}
 */
const generateToken = (
  data: object,
  expires: moment.Moment,
  tokenType: TokenTypes,
  secret = config.jwt.secret
): string => {
  const payload = {
    user: data,
    iat: moment().unix(),
    exp: expires.unix(),
    type: tokenType,
  };

  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {int} user_id
 * @param {string} uuid
 * @param {Moment} expires
 * @param {boolean} [blacklisted]
 * @returns {Promise<TokenInstance>}
 */
const saveToken = async (
  token: string,
  user_id: string,
  expires: moment.Moment,
  tokenType: TokenTypes,
  t?: Transaction
) => {
  const tk = await Token.findOne({ where: { user_id, type: tokenType }, transaction: t });
  if (tk) {
    tk.token = token;
    tk.expires = expires.toDate();
    await tk.save({ transaction: t });
    return tk.reload({ transaction: t });
  }

  const tokenDoc = await Token.create(
    { token, user_id, expires: expires.toDate(), type: tokenType },
    { transaction: t }
  );
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} secret
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, tokenType: TokenTypes) => {
  const payload = jwt.verify(token, config.jwt.secret) as any;

  if (payload == null) {
    throw new BadRequestError("Invalid or Expired token");
  }
  const tokenDoc = await Token.findOne({
    where: { token, type: tokenType, user_id: payload!.user!.user_id },
  });

  if (!tokenDoc) {
    throw new NotFoundError("Token not found");
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user: UserAttributes, store_ids: string[], t?: Transaction) => {
  const { role, user_id } = user;

  const payload = { user_id, role, stores: store_ids };
  const accessTokenExpires = moment().add(config.jwt.accessExpires, "minutes");
  const accessToken = generateToken(payload, accessTokenExpires, TokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpires, "days");
  const refreshToken = generateToken(payload, refreshTokenExpires, TokenTypes.REFRESH);

  await saveToken(refreshToken, user.user_id, refreshTokenExpires, TokenTypes.REFRESH, t);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const refreshToken = async (refresh_token: string) => {
  const verified = await verifyToken(refresh_token, TokenTypes.REFRESH);
  if (!verified) {
    throw new NotFoundError("Refresh Token not found");
  }

  const user = await userService.findById(verified.user_id);

  const stores = await storeService.findUserStores(verified.user_id, true);

  const store_ids = stores.map((s) => s.store_id);

  try {
    const result = await sequelize.transaction(async (transaction) => {
      await verified.destroy({ transaction });

      return generateAuthTokens(user, store_ids, transaction);
    });
    return result;
  } catch (error) {
    throw new BadRequestError(`${error}`);
  }
};

export = {
  generateToken,
  generateAuthTokens,
  saveToken,
  verifyToken,
  refreshToken,
};
