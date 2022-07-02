import fileUpload from "express-fileupload";

export enum MediaType {
  FOLDER = "folder",
  FILE = "file",
}

export interface CopyPayload {
  type: "folder" | "file";
  id: string; // folder_id | file_id
  parent_id: string;
}

export type File = fileUpload.UploadedFile;

export const FitEnum = {
  contain: "contain",
  cover: "cover",
  fill: "fill",
  inside: "inside",
  outside: "outside",
};

export interface ImageVariant {
  url: string;
  key: string;
  bucket: string;
  width?: number;
  height?: number;
  buffer?: Buffer;
}

export interface ImageVariantContent {
  variantName: string;
  metadata: ImageVariant;
  buffer: Buffer;
}

/** Pairs of `variantName: maxWidth` for image resizing. */
export type ImageBreakpoints = { [variantName: string]: number };
export type VideoBreakpoints = { [variantName: string]: number };
