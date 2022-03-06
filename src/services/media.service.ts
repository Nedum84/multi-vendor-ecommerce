import { Request } from "express";
import { NOT_FOUND } from "http-status";
import { Op, QueryTypes, Transaction } from "sequelize/dist";
import { ErrorResponse } from "../apiresponse/error.response";
import { MediaType } from "../enum/media.enum";
import sequelize, { MediaFiles, MediaFolder } from "../models";
import { MediaFilesAttributes, MediaFilesInstance } from "../models/media.files.model";
import { MediaFolderAttributes, MediaFolderInstance } from "../models/media.folder.model";
import { asyncForEach, mapAsync } from "../utils/function.utils";
import { Helpers } from "../utils/helpers";
import MediaUtils from "../utils/media.utils";
import { createModel, genUniqueColId } from "../utils/random.string";

//Create a folder
const createFolder = async (req: Request) => {
  const { user_id } = req.user!;
  const body: MediaFolderAttributes = req.body;
  body.created_by = user_id;

  type Ins = MediaFolderInstance;
  const folder = await createModel<Ins>(MediaFolder, body, "folder_id");

  return folder;
};

//Create a file
const createFile = async (req: Request) => {
  const { user_id } = req.user!;
  const body: MediaFilesAttributes = req.body;
  body.uploaded_by = user_id;

  type Ins = MediaFilesInstance;
  const file = await createModel<Ins>(MediaFiles, body, "file_id");

  return file;
};

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

interface CopyPayload {
  type: "folder" | "file";
  id: string;
  parent_id: string;
}
/*
copy a folder
${parent_id} is where I am copying to (Fot home, it's NULLie(parent_id=null))
*/
const copy = async (req: Request) => {
  const { user_id } = req.user!;
  const body: CopyPayload[] = req.body;

  /** Create folder */
  const createFolder = async (folder: MediaFolderInstance, transaction: Transaction) =>
    createModel<MediaFolderInstance>(MediaFolder, folder, "folder_id", transaction);

  /** Generates a unique file id */
  const fileUid = async () => await genUniqueColId(MediaFiles, "file_id", 10);

  /* Generates body payload for file(s)*/
  async function getFileBody(files: MediaFilesInstance[], folder_id: string) {
    const uid = await fileUid();

    return files.map((file, index) => {
      return { ...file, file_id: `${uid}${index + 1}`, folder_id };
    });
  }

  await sequelize
    .transaction(async (transaction) => {
      /*Loop through each & copy to parent*/
      // for await (const eachItem of body) {}
      await asyncForEach(body, async (eachItem) => {
        const { parent_id, type, id } = eachItem;
        //Checking if User is copying to child folder
        if (type == "folder") {
          const children = await getChildrenFolders(id);
          const checkIfParentIsChild = children.find((f) => f.folder_id === parent_id);
          if (checkIfParentIsChild) {
            throw new Error("You can't copy folder(s) to a child folder");
          }
        }

        //IS FOLDER
        if (type == "folder") {
          //Return plain objects(with no sequelize meta rubbish). Reason for @false param
          const folders = await findAllNestedFolders(id, true, false); //id===folder_id

          await asyncForEach(folders, async function (folder, index) {
            folder.parent_id = parent_id; //parent_id or null(FOR HOME)
            const { folder_id } = await createFolder(folder, transaction); //depth 1{d1}

            if (folder.files) {
              const files = await getFileBody(folder.files, folder_id);
              await MediaFiles.bulkCreate(files, { transaction });
            }
            //-----> Check for Nested folders
            if (folder.folders?.length) {
              // --> update parent_id to the parent folder_id
              folder.folders = folder.folders.map((f) => ({ ...f, parent_id: folder_id })) as any;
              await asyncForEach(folder.folders, async function (folder, index) {
                const { folder_id } = await createFolder(folder, transaction); //d2
                if (folder.files) {
                  const files = await getFileBody(folder.files, folder_id);
                  await MediaFiles.bulkCreate(files, { transaction });
                }
                //-----> Check for Nested folders
                if (folder.folders?.length) {
                  // --> update parent_id to the parent folder_id
                  folder.folders = folder.folders.map((f) => ({ ...f, parent_id: folder_id })) as any;
                  await asyncForEach(folder.folders, async function (folder, index) {
                    const { folder_id } = await createFolder(folder, transaction); //d3
                    if (folder.files) {
                      const uid = await fileUid();
                      const files = await getFileBody(folder.files, folder_id);
                      await MediaFiles.bulkCreate(files, { transaction });
                    }
                    //-----> Check for Nested folders
                    if (folder.folders?.length) {
                      // --> update parent_id to the parent folder_id
                      folder.folders = folder.folders.map((f) => ({ ...f, parent_id: folder_id })) as any;
                      await asyncForEach(folder.folders, async function (folder, index) {
                        const { folder_id } = await createFolder(folder, transaction); //d4
                        if (folder.files) {
                          const files = await getFileBody(folder.files, folder_id);
                          await MediaFiles.bulkCreate(files, { transaction });
                        }
                        //-----> Check for Nested folders
                        if (folder.folders?.length) {
                          // --> update parent_id to the parent folder_id
                          folder.folders = folder.folders.map((f) => ({ ...f, parent_id: folder_id })) as any;
                          await asyncForEach(folder.folders, async function (folder) {
                            const { folder_id } = await createFolder(folder, transaction); //d5
                            if (folder.files) {
                              const files = await getFileBody(folder.files, folder_id);
                              await MediaFiles.bulkCreate(files, { transaction });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        } else {
          const file = await findFileById(id); //id===file_id
          file.folder_id = parent_id;
          //-->inserts
          await createModel<MediaFilesInstance>(MediaFiles, file.toJSON(), "file_id", transaction);
        }
      });
    })
    .catch((e) => {
      throw new Error(e);
    });

  return "Files/Folders successfully copied";
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

  return "Moved successfully";
};

//delete a folder
const deleteFolder = async (req: Request) => {
  const { folder_id } = req.params;

  //find all children
  const children = await getChildrenFolders(folder_id);
  const ids = children.map((i) => i.folder_id);

  const del = await MediaFolder.destroy({
    where: {
      folder_id: { [Op.in]: [...ids, folder_id] }, //delete parent & children
    },
  });

  return !!del;
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
    throw new ErrorResponse("Folder not found", NOT_FOUND);
  }

  return folder;
};
const findFileById = async (file_id: string) => {
  const file = await MediaFiles.findOne({
    where: { file_id },
  });
  if (!file) {
    throw new ErrorResponse("Folder not found", NOT_FOUND);
  }

  return file;
};

/**Immediate Folders or files or both under home */
const homeMedia = async (query?: any, media_type?: MediaType) => {
  const options = Helpers.getPaginate(query ?? {});
  const result: { [k: string]: any } = {};

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

  return result as {
    folders: MediaFolderInstance[];
    files: MediaFilesInstance[];
  };
};

//Immediate media(folders/files) under a folder
const folderMedia = async (folder_id: string, query?: any, media_type?: MediaType) => {
  const options = Helpers.getPaginate(query ?? {});
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
  const query = MediaUtils.allFolders(folder_id, include_files);

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
  const query = MediaUtils.getParentFolders(folder_id, direction);

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
  const query = MediaUtils.getChildFolders(folder_id, direction);

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
