import faker from "faker";
import { MediaFiles, MediaFolder } from "../ec-models";
import userFake from "../ec-user/user.fake";
import { generateChars } from "../ec-utils/random.string";

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
    const { folder_id, created_by } = await this.rawCreateFolder();
    const data = {
      ...this.createFile(),
      folder_id,
      file_id: generateChars(),
      created_by,
      ...props,
    };
    return MediaFiles.create(data);
  },
  createFolder: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
  }),
  createFile: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
    url: faker.random.image(),
    size: 20,
    mime: "image/jpeg",
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
