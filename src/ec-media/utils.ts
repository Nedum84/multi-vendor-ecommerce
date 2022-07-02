import { Transaction } from "sequelize";
import { MediaFiles, MediaFolder } from "../ec-models";
import { createModel, genUniqueColId } from "../ec-models/utils";
import { MediaFilesAttributes } from "./model.media.files";
import { MediaFolderInstance } from "./model.media.folder";
import { fileNameRegex } from "./constants";
import { v4 as uuidv4 } from "uuid";
import sanitize from "sanitize-filename";
import config from "../ec-config/config";

/**
 * Recursive fn
 * Copies contents from folders {@param  MediaFolderInstance[]} to parent_id {@param string}
 */
export const copyMediaFoldersFiles = async (
  folders: MediaFolderInstance[],
  parent_id: string,
  transaction: Transaction
) => {
  for await (const folder of folders) {
    if (!folder.parent_id) {
      // this would run only once (first time when parent_id isn't set)
      folder.parent_id = parent_id; //parent_id or null(FOR HOME)
    }
    const { folder_id } = await createModel(MediaFolder, folder, "folder_id", { transaction });

    if (folder.files) {
      const fileId = await genUniqueColId<MediaFilesAttributes>(MediaFiles, "file_id", 10);
      const files = folder.files.map((file, index) => ({
        ...file,
        file_id: `${fileId}${index + 1}`,
        folder_id,
      }));

      await MediaFiles.bulkCreate(files, { transaction });
    }
    //-----> Check for Nested folders
    if (folder.folders?.length) {
      // --> update parent_id to the parent folder_id
      folder.folders = folder.folders.map((f) => ({ ...f, parent_id: folder_id })) as any;
      await copyMediaFoldersFiles(folder.folders, parent_id, transaction);
    }
  }
};

export const isImage = (fileName: string) => {
  const [_, extension] = fileName.toLowerCase().split(fileNameRegex);
  return extension === "png" || extension === "jpg" || extension === "jpeg";
};

export const isPDF = (fileName: string) => {
  const [_, extension] = fileName.toLowerCase().split(fileNameRegex);
  return extension === "pdf";
};
export const isZip = (fileName: string) => {
  const [_, extension] = fileName.toLowerCase().split(fileNameRegex);
  return extension === "zip";
};
export const isIcs = (fileName: string) => {
  const [_, extension] = fileName.toLowerCase().split(fileNameRegex);
  return extension === "ics";
};
export const isVideo = (fileName: string) => {
  const [_, extension] = fileName.toLowerCase().split(fileNameRegex);
  return extension === "mp4" || extension === "mov";
};

export const uploadPath = (fileName: string): string => {
  if (isImage(fileName)) {
    return config.AWS_S3_IMAGE_UPLOAD_PATH;
  }
  if (isPDF(fileName)) {
    return config.AWS_S3_PDF_UPLOAD_PATH;
  }
  if (isZip(fileName)) {
    return config.AWS_S3_ZIP_UPLOAD_PATH;
  }
  if (isIcs(fileName)) {
    return config.AWS_S3_ICS_UPLOAD_PATH;
  }
  if (isVideo(fileName)) {
    return config.AWS_S3_VIDEO_UPLOAD_PATH;
  }

  return config.AWS_S3_OTHERS_UPLOAD_PATH;
};

export const hashFileName = (fileName: string) => {
  const [name, extension] = fileName.split(fileNameRegex);
  const hash = uuidv4();

  return `${name ? `${sanitize(name)}-` : ""}${hash}${extension ? `.${extension}` : ""}`;
};

export const sanitizeFileName = (fileName: string) => {
  const [name, extension] = fileName.split(fileNameRegex);

  return `${name ? `${sanitize(name)}` : ""}${extension ? `.${extension}` : ""}`;
};
