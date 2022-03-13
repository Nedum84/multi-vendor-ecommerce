import faker from "faker";
import { Tag } from "../../src/models";
import { generateChars } from "../../src/utils/random.string";

export default {
  rawCreate: async function (props?: any) {
    const data = {
      ...this.create,
      tag_id: generateChars(),
      slug: generateChars(),
      ...props,
    };
    return Tag.create(data);
  },
  create: {
    name: faker.random.words(3),
  },
  update: {
    name: faker.random.words(3),
    is_active: true,
  },
};
