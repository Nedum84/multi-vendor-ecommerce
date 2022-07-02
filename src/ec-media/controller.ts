import { Request, Response } from "express";
import { SuccessResponse } from "../ec-api-response/success.response";
import mediaService from "./service";

const createFolder = async (req: Request, res: Response) => {
  const result = await mediaService.createFolder(req);
  SuccessResponse.ok(res, { folder: result });
};
const createFiles = async (req: Request, res: Response) => {
  const result = await mediaService.createFiles(req);
  SuccessResponse.ok(res, result);
};
const updateFolder = async (req: Request, res: Response) => {
  const result = await mediaService.updateFolder(req);
  SuccessResponse.ok(res, { folder: result });
};
const updateFile = async (req: Request, res: Response) => {
  const result = await mediaService.updateFile(req);
  SuccessResponse.ok(res, { file: result });
};
const copy = async (req: Request, res: Response) => {
  const result = await mediaService.copy(req);
  SuccessResponse.ok(res, result);
};
const move = async (req: Request, res: Response) => {
  const result = await mediaService.move(req);
  SuccessResponse.ok(res, result);
};
const deleteFolder = async (req: Request, res: Response) => {
  const result = await mediaService.deleteFolder(req);
  SuccessResponse.ok(res, result, "Successfully deleted this folder");
};
const deleteFile = async (req: Request, res: Response) => {
  const result = await mediaService.deleteFile(req);
  SuccessResponse.ok(res, result, "Successfully deleted this file ");
};
const findFolderById = async (req: Request, res: Response) => {
  const { folder_id } = req.params;
  const result = await mediaService.findFolderById(folder_id);
  SuccessResponse.ok(res, { folder: result });
};
const findFileById = async (req: Request, res: Response) => {
  const { file_id } = req.params;
  const result = await mediaService.findFileById(file_id);
  SuccessResponse.ok(res, { file: result });
};
const homeMedia = async (req: Request, res: Response) => {
  const { media_type } = req.query as any; //"file" | "folder" (optional)
  const result = await mediaService.homeMedia(req.query, media_type);
  SuccessResponse.ok(res, result);
};
const folderMedia = async (req: Request, res: Response) => {
  const { folder_id } = req.params;
  const { media_type } = req.query as any; //"file" | "folder" (optional)
  const result = await mediaService.folderMedia(folder_id, req.query, media_type);
  SuccessResponse.ok(res, result);
};
const findAllNestedFolders = async (req: Request, res: Response) => {
  const { folder_id, include_files = false } = req.query as any;
  const result = await mediaService.findAllNestedFolders(folder_id, include_files);
  SuccessResponse.ok(res, { folders: result });
};
const getParentFolders = async (req: Request, res: Response) => {
  const result = await mediaService.getParentFolders(req);
  SuccessResponse.ok(res, { folders: result });
};
const getChildrenFolders = async (req: Request, res: Response) => {
  const { folder_id } = req.params;
  const { direction } = req.query as any; //direction=>optional
  const result = await mediaService.getChildrenFolders(folder_id, direction);
  SuccessResponse.ok(res, { folders: result });
};

export default {
  createFolder,
  createFiles,
  updateFolder,
  updateFile,
  copy,
  move,
  deleteFolder,
  deleteFile,
  findFolderById,
  findFileById,
  homeMedia,
  folderMedia,
  findAllNestedFolders,
  getParentFolders,
  getChildrenFolders,
};
