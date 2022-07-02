import { Request } from "express";
import { QueryTypes } from "sequelize";
import { CopyPayload, File, ImageBreakpoints, MediaType } from "./types";
import sequelize, { MediaFiles, MediaFolder } from "../ec-models";
import { MediaFilesAttributes, MediaFilesInstance } from "./model.media.files";
import { MediaFolderAttributes, MediaFolderInstance } from "./model.media.folder";
import { createModel, getPaginate } from "../ec-models/utils";
import { NotFoundError } from "../ec-api-response/not.found.error";
import { allFoldersQuery, getChildFoldersQuery, getParentFoldersQuery } from "./utils.query";
import { isEmpty } from "lodash";
import { copyMediaFoldersFiles, hashFileName, sanitizeFileName, uploadPath } from "./utils";
import fileupload from "express-fileupload";
import { BadRequestError } from "../ec-api-response/bad.request.error";
import { getImageDimensions } from "./image.optimization";
import { bucketName, defaultImageBreakpoints } from "./constants";
import { createAndUploadVariants } from "./utils.image.variations";
import { uploadFile } from "./utils.s3";

//Create a folder
const createFolder = async (req: Request) => {
  const { user_id } = req.user!;
  const body: MediaFolderAttributes = req.body;
  body.created_by = user_id;

  type Ins = MediaFolderInstance;
  const folder = await createModel<Ins>(MediaFolder, body, "folder_id");

  return folder;
};

// Create file(s)
async function createFiles(req: Request) {
  const { user_id } = req.user!;
  const { folder_id } = req.body;
  console.log(req.body, "HEY!");

  // grabs all the the attached files
  const fileArray: fileupload.FileArray | undefined = req.files;
  if (!fileArray || isEmpty(fileArray)) {
    throw new BadRequestError("File not found");
  }

  /** checks if @params files was pass from the form data */
  if (!fileArray.files) {
    throw new BadRequestError("File attachment failed, use 'files' field/key on the form data");
  }

  const files: File[] = [];
  const selectedFiles: File[] | File = fileArray.files; // grabs the 'files' field from the form-data
  if (selectedFiles instanceof Array) {
    files.push(...selectedFiles);
  } else {
    files.push(selectedFiles);
  }

  const fileStorages: MediaFilesInstance[] = [];
  for await (const file of files) {
    const hashedFileName = hashFileName(file.name);
    const fileName = sanitizeFileName(file.name);
    const _uploadPath = uploadPath(fileName);
    const key = `${_uploadPath}/${hashedFileName}`;

    const { width, height } = await getImageDimensions(file.data);

    // const breakpoints: ImageBreakpoints = {
    //   x515: 515,
    // };
    const breakpoints: ImageBreakpoints = defaultImageBreakpoints;
    const variants = await createAndUploadVariants(file, hashedFileName, breakpoints);

    const url = await uploadFile(key, file.data);

    const fileStorage = await createModel<MediaFilesInstance, MediaFilesAttributes>(
      MediaFiles,
      {
        folder_id,
        name: fileName,
        bucket: bucketName,
        url,
        key,
        size: file.size,
        width,
        height,
        mime: file.mimetype,
        created_by: user_id,
        variants,
      },
      "file_id"
    );
    fileStorages.push(fileStorage);
  }

  return fileStorages;
}

//update folder
const updateFolder = async (req: Request) => {
  const { folder_id } = req.params;
  const body: MediaFolderAttributes = req.body;
  const folder = await findFolderById(folder_id);

  Object.assign(folder, body);
  await folder.save();

  return folder.reload();
};

//update folder
const updateFile = async (req: Request) => {
  const { file_id } = req.params;
  const body: MediaFolderAttributes = req.body;
  const filde = await findFileById(file_id);

  Object.assign(filde, body);
  await filde.save();

  return filde.reload();
};
/**
copy a folder
${parent_id} is where I am copying to (Fot home, it's NULL i.e(parent_id=null))
*/
const copy = async (req: Request) => {
  const { user_id } = req.user!;
  const body: CopyPayload[] = req.body;

  await sequelize
    .transaction(async (transaction) => {
      /*Loop through each & copy to parent*/
      for await (const eachItem of body) {
        const { parent_id, type, id } = eachItem;
        if (type == "folder") {
          const folderId = id;
          //Checking if User is copying to child folder
          const children = await getChildrenFolders(folderId);
          const checkIfParentIsChild = children.find((f) => f.folder_id === parent_id);
          if (checkIfParentIsChild) {
            throw new Error("You can't copy parent folder to a child folder");
          }

          //Return plain objects(with no sequelize meta rubbish). Reason for @false param
          const folders = await findAllNestedFolders(folderId, true, false); //id===folder_id

          // copy the files/folders
          await copyMediaFoldersFiles(folders, parent_id, transaction);
        } else {
          const fileId = id;
          const file = await findFileById(fileId);
          file.folder_id = parent_id;
          //-->inserts
          await createModel<MediaFilesInstance>(MediaFiles, file.toJSON(), "file_id", {
            transaction,
          });
        }
      }
    })
    .catch((e) => {
      throw new Error(e);
    });

  return "File(s)/Folder(s) successfully copied";
};

//move a folder
const move = async (req: Request) => {
  const body: CopyPayload[] = req.body;
  /*Loop through each & copy to parent*/
  for await (const eachItem of body) {
    const { parent_id, type, id } = eachItem;

    //IS FOLDER
    if (type == "folder") {
      const folder = await findFolderById(id); //id===folder_id
      folder.parent_id = parent_id;
      await folder.save();
    } else {
      const file = await findFileById(id); //id===file_id
      file.folder_id = parent_id;
      await file.save();
    }
  }

  return "File(s)/Folder(s) moved successfully";
};

//delete a folder
const deleteFolder = async (req: Request) => {
  const { folder_id } = req.params;

  //find all children
  const children = await getChildrenFolders(folder_id);
  const ids = children.map((i) => i.folder_id);

  await sequelize.transaction(async (transaction) => {
    for await (const folder of [...ids, folder_id]) {
      await MediaFolder.destroy({ where: { folder_id: folder }, transaction });
      // Delete associated files
      await MediaFiles.destroy({ where: { folder_id: folder }, transaction });
      // TODO: Delete the files from S3
    }
  });

  return true;
};

//delete a folder
const deleteFile = async (req: Request) => {
  const { file_id } = req.params;

  const del = await MediaFiles.destroy({ where: { file_id } });

  return !!del;
};

const findFolderById = async (folder_id: string) => {
  const folder = await MediaFolder.findOne({
    where: { folder_id },
  });
  if (!folder) {
    throw new NotFoundError("Folder not found");
  }

  return folder;
};
const findFileById = async (file_id: string) => {
  const file = await MediaFiles.findOne({
    where: { file_id },
  });
  if (!file) {
    throw new NotFoundError("File not found");
  }

  return file;
};

/**Immediate Folders or files or both under home */
const homeMedia = async (query?: any, media_type?: MediaType) => {
  const options = getPaginate(query ?? {});
  const result: { folders?: MediaFolderInstance[]; files?: MediaFilesInstance[] } = {};

  if (!media_type || media_type === MediaType.FOLDER) {
    result.folders = await MediaFolder.findAll({
      where: { parent_id: null },
      order: [["createdAt", "ASC"]],
      ...options,
    });
  }
  if (!media_type || media_type === MediaType.FILE) {
    result.files = await MediaFiles.findAll({
      where: { folder_id: null },
      order: [["createdAt", "ASC"]],
      ...options,
    });
  }

  return result;
};

//Immediate media(folders/files) under a folder
const folderMedia = async (folder_id: string, query?: any, media_type?: MediaType) => {
  const options = getPaginate(query ?? {});
  const result: { [k: string]: any } = {};

  if (!media_type || media_type === MediaType.FOLDER) {
    result.folders = await MediaFolder.findAll({
      where: { parent_id: folder_id },
      order: [["createdAt", "ASC"]],
      ...options,
    });
  }
  if (!media_type || media_type === MediaType.FILE) {
    result.files = await MediaFiles.findAll({
      where: { folder_id },
      order: [["createdAt", "ASC"]],
      ...options,
    });
  }

  return result as {
    folders: MediaFolderInstance[];
    files: MediaFilesInstance[];
  };
};

/**
 * find all nested folders(using sequelize raw query {pros: max can be of depth n, 😀})
 * @returns Array<MediaFolderInstance>
 */
const findAllNestedFolders = async (folder_id?: string, include_files = false, modelMap = true) => {
  const modelToMap = modelMap ? { mapToModel: true, model: MediaFolder } : {};
  const query = allFoldersQuery(folder_id, include_files);

  const folders: MediaFolderInstance[] = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    nest: true,
    ...modelToMap,
  });
  return folders;
};

//With sequelize includes
const findAllNestedFolders2 = async (folder_id?: string, include_files = false) => {
  const where = folder_id ? { folder_id } : { parent_id: null };
  const incFile = include_files ? { model: MediaFiles, as: "files" } : {};

  const folders = await MediaFolder.findAll({
    where,
    include: {
      model: MediaFolder,
      as: "folders",
      include: [
        incFile, //inc files arr
        {
          model: MediaFolder,
          as: "folders",
          include: [
            incFile, //inc files arr
            {
              model: MediaFolder,
              as: "folders",
              include: [
                incFile, //inc files arr
                {
                  model: MediaFolder,
                  as: "folders",
                  include: [
                    incFile, //inc files arr
                    {
                      model: MediaFolder,
                      as: "folders",
                      include: [
                        incFile, //inc files arr
                        {
                          model: MediaFolder,
                          as: "folders",
                          include: [
                            incFile, //inc files arr
                            {
                              model: MediaFolder,
                              as: "folders",
                              include: [
                                incFile, //inc files arr
                                {
                                  model: MediaFolder,
                                  as: "folders",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  return folders;
};

//find nested all folders up the tree
const getParentFolders = async (req: Request) => {
  const { folder_id } = req.params;
  const { direction } = req.query as any;
  const query = getParentFoldersQuery(folder_id, direction);

  const folders: MediaFolderInstance[] = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    nest: true,
    mapToModel: true,
    model: MediaFolder,
  });
  return folders;
};
//find nested all folders down the tree
const getChildrenFolders = async (folder_id: string, direction?: string) => {
  const query = getChildFoldersQuery(folder_id, direction);

  const folders: MediaFolderInstance[] = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    nest: true,
    mapToModel: true,
    model: MediaFolder,
  });

  return folders;
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
