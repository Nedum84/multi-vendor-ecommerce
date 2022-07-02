import faker from "faker";
import { Category } from "../ec-models";
import { generateChars } from "../ec-utils/random.string";

export default {
  create: {
    name: faker.random.words(2),
  },
  rawCreate: async function (props?: any) {
    const data = {
      ...this.create,
      category_id: generateChars(),
      ...props,
    };
    return Category.create(data);
  },
  update: {
    name: "updated",
  },
};
