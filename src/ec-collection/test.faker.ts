import faker from "faker";
import { CollectStatus } from "./types";
import { Collection } from "../ec-models";
import { generateChars } from "../ec-utils/random.string";

export default {
  rawCreate: async function (props?: any) {
    const data = {
      ...this.create,
      collection_id: generateChars(),
      slug: generateChars(),
      ...props,
    };
    return Collection.create(data);
  },
  create: {
    name: faker.random.words(3),
    description: faker.random.words(20),
    status: CollectStatus.PENDING,
  },
  update: {
    name: faker.random.words(3),
    description: faker.random.words(20),
    status: CollectStatus.PUBLISHED,
  },
};
