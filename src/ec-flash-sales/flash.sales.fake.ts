import faker from "faker";
import { FlashSales } from "../ec-models";
import { generateChars } from "../ec-utils/random.string";

export default {
  rawCreate: async function (props?: any) {
    const data = {
      ...this.create,
      flash_sale_id: generateChars(32),
      ...props,
    };
    return FlashSales.create(data);
  },
  create: {
    name: faker.random.words(3),
    start_date: new Date(),
    end_date: new Date(Date.now() + 48 * 3600), //next 2 days
  },
  update: {
    name: faker.random.words(12),
    start_date: new Date(),
    end_date: new Date(Date.now() + 3 * 24 * 3600), //next 3 days
  },
};
