import faker from "faker";
import { ProductAttribute, ProductAttributeSets } from "../ec-models";
import { generateChars } from "../ec-utils/random.string";

export default {
  rawCreate: async function (props?: any) {
    const data = {
      ...this.create,
      attribute_id: generateChars(),
      ...props,
    };
    return ProductAttribute.create(data);
  },
  rawCreateAttributeSet: async function (props?: any) {
    const { attribute_id } = await this.rawCreate();
    const data = {
      ...this.createAttributeSet,
      attribute_set_id: generateChars(),
      attribute_id,
      ...props,
    };
    return ProductAttributeSets.create(data);
  },
  create: {
    name: faker.random.words(2),
    desc: faker.random.words(6),
  },
  update: {
    name: faker.random.words(2),
    desc: faker.random.words(6),
  },
  createAttributeSet: {
    value: faker.random.words(1),
    color: faker.random.words(2),
    image: faker.random.image(),
  },
  updateAttributeSet: {
    value: faker.random.words(1),
    color: faker.random.words(2),
    image: faker.random.image(),
  },
};
