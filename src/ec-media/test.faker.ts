import faker from "faker";
import { MediaFiles, MediaFolder } from "../ec-models";
import userFake from "../ec-user/test.faker";
import { generateChars } from "../ec-utils/random.string";
import { pngFilePath } from "./test";
import { hashFileName, sanitizeFileName, uploadPath } from "./utils";
import { uploadFile } from "./utils.s3";
import fs from "fs";
import { bucketName } from "./constants";
import { MediaFilesAttributes } from "./model.media.files";

export default {
  rawCreateFolder: async function (props?: any) {
    const { user_id } = await userFake.rawCreate();

    const data = {
      ...this.createFolder(),
      folder_id: generateChars(),
      created_by: user_id,
      ...props,
    };
    return MediaFolder.create(data);
  },
  rawCreateFile: async function (props?: any) {
    const payload = this.createFile();
    const { folder_id, created_by } = await this.rawCreateFolder();
    // upload file to s3...
    const fileBuffer = fs.readFileSync(pngFilePath);
    const hashedFileName = hashFileName(payload.name);
    const fileName = sanitizeFileName(payload.name);
    const key = `${uploadPath(fileName)}/${hashedFileName}`;

    const url = await uploadFile(key, fileBuffer);

    const data: MediaFilesAttributes = {
      ...payload,
      folder_id,
      file_id: generateChars(),
      created_by,
      key,
      bucket: bucketName,
      url,
      variants: {},
      ...props,
    };
    return MediaFiles.create(data);
  },
  createFolder: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
  }),
  createFile: () => ({
    name: "faker_test_image_2.png",
    desc: faker.random.words(10),
    url: faker.random.image(),
    size: 20,
    mime: "image/png",
    key: "test-file/sample.jpeg",
    bucket: "bucket-name",
  }),
  updateFolder: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
  }),
  updateFile: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
  }),
};
