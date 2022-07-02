import express from "express";
import mediaController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import mediaValidation from "./validation";

const router = express.Router();

//Auth Routes...
router.use(requireAuth);

router.post("/folder", validateReq(mediaValidation.createFolder), mediaController.createFolder);
router.post("/files", mediaController.createFiles);
router.patch(
  "/folder/:folder_id",
  validateReq(mediaValidation.updateFolder),
  mediaController.updateFolder
);
router.patch("/file/:file_id", validateReq(mediaValidation.updateFile), mediaController.updateFile);
router.post("/copy", validateReq(mediaValidation.copy), mediaController.copy);
router.post("/move", validateReq(mediaValidation.move), mediaController.move);
router.delete(
  "/folder/:folder_id",
  validateReq(mediaValidation.deleteFolder),
  mediaController.deleteFolder
);
router.delete(
  "/file/:file_id",
  validateReq(mediaValidation.deleteFile),
  mediaController.deleteFile
);

router.get(
  "/folder/nested",
  validateReq(mediaValidation.findAllNestedFolders),
  mediaController.findAllNestedFolders
);
router.get("/home", validateReq(mediaValidation.homeMedia), mediaController.homeMedia);
router.get(
  "/folder/:folder_id",
  validateReq(mediaValidation.folderMedia),
  mediaController.folderMedia
);
router.get(
  "/parent/:folder_id",
  validateReq(mediaValidation.getParentFolders),
  mediaController.getParentFolders
);
router.get(
  "/children/:folder_id",
  validateReq(mediaValidation.getChildrenFolders),
  mediaController.getChildrenFolders
);

router.get(
  "/folder/:folder_id",
  validateReq(mediaValidation.findFolderById),
  mediaController.findFolderById
);
router.get(
  "/file/:file_id",
  validateReq(mediaValidation.findFileById),
  mediaController.findFileById
);
export default router;
