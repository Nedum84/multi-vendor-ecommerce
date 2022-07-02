import config from "../ec-config/config";
import { ImageBreakpoints } from "./types";

export const fileNameRegex = /\.(?=[^.]*$)/;

export const bucketName = config.AWS_S3_BUCKET_NAME;

export const defaultImageBreakpoints: ImageBreakpoints = {
  large: 1000,
  medium: 750,
  small: 500,
  thumbnail: 150,
  placeholder: 16,
};
