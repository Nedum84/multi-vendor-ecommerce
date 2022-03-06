import { Request, Response } from "express";
import { ApiResponse } from "../apiresponse/api.response";
import mediaService from "../services/media.service";

const createFolder = async (req: Request, res: Response) => {
  const result = await mediaService.createFolder(req);
  ApiResponse.created(res, { folder: result });
};
const createFile = async (req: Request, res: Response) => {
  const result = await mediaService.createFile(req);
  ApiResponse.created(res, { file: result });
};
const updateFolder = async (req: Request, res: Response) => {
  const result = await mediaService.updateFolder(req);
  ApiResponse.ok(res, { folder: result });
};
const updateFile = async (req: Request, res: Response) => {
  const result = await mediaService.updateFile(req);
  ApiResponse.ok(res, { file: result });
};
const copy = async (req: Request, res: Response) => {
  const result = await mediaService.copy(req);
  ApiResponse.ok(res, result);
};
const move = async (req: Request, res: Response) => {
  const result = await mediaService.move(req);
  ApiResponse.ok(res, result);
};
const deleteFolder = async (req: Request, res: Response) => {
  const result = await mediaService.deleteFolder(req);
  ApiResponse.ok(res, result, "Successfully deleted this folder");
};
const deleteFile = async (req: Request, res: Response) => {
  const result = await mediaService.deleteFile(req);
  ApiResponse.ok(res, result, "Successfully deleted this file ");
};
const findFolderById = async (req: Request, res: Response) => {
  const { folder_id } = req.params;
  const result = await mediaService.findFolderById(folder_id);
  ApiResponse.ok(res, { folder: result });
};
const findFileById = async (req: Request, res: Response) => {
  const { file_id } = req.params;
  const result = await mediaService.findFileById(file_id);
  ApiResponse.ok(res, { file: result });
};
const homeMedia = async (req: Request, res: Response) => {
  const { media_type } = req.query as any; //"file" | "folder" (optional)
  const result = await mediaService.homeMedia(req.query, media_type);
  ApiResponse.ok(res, result);
};
const folderMedia = async (req: Request, res: Response) => {
  const { folder_id } = req.params;
  const { media_type } = req.query as any; //"file" | "folder" (optional)
  const result = await mediaService.folderMedia(folder_id, req.query, media_type);
  ApiResponse.ok(res, result);
};
const findAllNestedFolders = async (req: Request, res: Response) => {
  const { folder_id, include_files = false } = req.query as any;
  const result = await mediaService.findAllNestedFolders(folder_id, include_files);
  ApiResponse.ok(res, { folders: result });
};
const getParentFolders = async (req: Request, res: Response) => {
  const result = await mediaService.getParentFolders(req);
  ApiResponse.ok(res, { folders: result });
};
const getChildrenFolders = async (req: Request, res: Response) => {
  const { folder_id } = req.params;
  const { direction } = req.query as any; //direction=>optional
  const result = await mediaService.getChildrenFolders(folder_id, direction);
  ApiResponse.ok(res, { folders: result });
};

export default {
  createFolder,
  createFile,
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
