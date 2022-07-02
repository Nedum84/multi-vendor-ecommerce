import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().default("development"),
    REGION: Joi.string().default("eu-west-2"),
    PORT: Joi.number().default(8082),
    JWT_SECRET: Joi.string().description("JWT secret key").default("jwt-token-secret"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(90)
      .description("days after which refresh tokens expire"),
    DB_NAME: Joi.string().default("db-name"),
    DB_TEST_NAME: Joi.string().default("test_db"),
    DB_USERNAME: Joi.string().default("postgres"),
    DB_PASSWORD: Joi.string().default("1223"),
    DB_HOST: Joi.string().default("localhost"),
    DB_PORT: Joi.number().default(5432),
    AWS_S3_BUCKET_NAME: Joi.string().default("bucket-name-sc"),
    AWS_REGION: Joi.string().default("eu-west-2"),
    AWS_S3_DISTRIBUTION: Joi.string().description("cdn path"),
    AWS_S3_IMAGE_UPLOAD_PATH: Joi.string().default("image"),
    AWS_S3_VIDEO_UPLOAD_PATH: Joi.string().default("video"),
    AWS_S3_PDF_UPLOAD_PATH: Joi.string().default("pdf"),
    AWS_S3_ZIP_UPLOAD_PATH: Joi.string().default("zip"),
    AWS_S3_ICS_UPLOAD_PATH: Joi.string().default("ics"),
    AWS_S3_OTHERS_UPLOAD_PATH: Joi.string().default("others"),
    MINIO_BASE_URL: Joi.string().default("http://localhost:9000"), // aka - MINIO_S3_ENDPOINT
    MINIO_USERNAME: Joi.string().default("admin"),
    MINIO_PASSWORD: Joi.string().default("Ecommerce-1234"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  ...process.env,
  env: envVars.NODE_ENV,
  PORT: envVars.PORT,
  REGION: envVars.REGION,
  NODE_ENV: envVars.NODE_ENV,
  DB_NAME: envVars.DB_NAME,
  DB_TEST_NAME: envVars.DB_TEST_NAME,
  DB_USERNAME: envVars.DB_USERNAME,
  DB_PASSWORD: envVars.DB_PASSWORD,
  DB_HOST: envVars.DB_HOST,
  DB_PORT: envVars.DB_PORT,
  PAYSTACK_SECRET_KEY: envVars.PAYSTACK_SECRET_KEY,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpires: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpires: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  AWS_S3_BUCKET_NAME: envVars.AWS_S3_BUCKET_NAME,
  AWS_REGION: envVars.AWS_REGION,
  AWS_S3_DISTRIBUTION: envVars.AWS_S3_DISTRIBUTION,
  AWS_S3_IMAGE_UPLOAD_PATH: envVars.AWS_S3_IMAGE_UPLOAD_PATH,
  AWS_S3_VIDEO_UPLOAD_PATH: envVars.AWS_S3_VIDEO_UPLOAD_PATH,
  AWS_S3_PDF_UPLOAD_PATH: envVars.AWS_S3_PDF_UPLOAD_PATH,
  AWS_S3_ZIP_UPLOAD_PATH: envVars.AWS_S3_ZIP_UPLOAD_PATH,
  AWS_S3_ICS_UPLOAD_PATH: envVars.AWS_S3_ICS_UPLOAD_PATH,
  AWS_S3_OTHERS_UPLOAD_PATH: envVars.AWS_S3_OTHERS_UPLOAD_PATH,
  MINIO_BASE_URL: envVars.MINIO_BASE_URL,
  MINIO_USERNAME: envVars.MINIO_USERNAME,
  MINIO_PASSWORD: envVars.MINIO_PASSWORD,
};
