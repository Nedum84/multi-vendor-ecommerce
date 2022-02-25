import faker from "faker";
import { Store } from "../../src/models";
import { generateSlug } from "../../src/utils/function.utils";
import { generateChars, genSlugColId } from "../../src/utils/random.string";
import userFake from "./user.fake";

export default {
  rawCreate: async function (props?: any) {
    const { user_id } = await userFake.rawCreate();

    const data = {
      ...this.create,
      store_id: generateChars(),
      user_id,
      ...props,
    };
    const slug = generateSlug(data.name);
    data.slug = await genSlugColId(Store, "slug", slug);

    return Store.create(data);
  },
  create: {
    name: faker.random.words(2),
    email: faker.random.words(2),
    phone: faker.random.words(2),
    logo: faker.random.words(2),
    address: faker.lorem.sentences(1),
    city: faker.random.words(2),
    state: faker.random.words(2),
    country: faker.random.words(2),
    description: faker.lorem.sentences(30),
  },
  update: {
    name: faker.random.words(2),
    email: faker.random.words(2),
    phone: faker.random.words(2),
    logo: faker.random.words(2),
    address: faker.lorem.sentences(1),
    city: faker.random.words(2),
    state: faker.random.words(2),
    country: faker.random.words(2),
    description: faker.lorem.sentences(30),
  },
};
