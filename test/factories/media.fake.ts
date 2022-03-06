import faker from "faker";
import { FileType } from "../../src/enum/media.enum";
import { MediaFiles, MediaFolder } from "../../src/models";
import { generateChars } from "../../src/utils/random.string";
import userFake from "./user.fake";

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
      uploaded_by: created_by,
      ...props,
    };
    return MediaFiles.create(data);
  },
  createFolder: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
    icon: faker.random.words(2),
  }),
  createFile: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
    icon: faker.random.words(2),
    url: faker.random.image(),
    size_in_mb: 20,
    ext: "mp4",
    file_type: FileType.IMAGE,
  }),
  updateFolder: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
    icon: faker.random.words(2),
  }),
  updateFile: () => ({
    name: faker.random.words(3),
    desc: faker.random.words(10),
    icon: faker.random.words(2),
  }),
};
