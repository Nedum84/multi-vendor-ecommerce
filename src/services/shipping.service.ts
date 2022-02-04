import { CartInstance } from "../models/cart.model";
import { asyncForEach } from "../utils/function.utils";

async function getTotalShipping(carts: CartInstance[], address_id: string) {
  let total = 0;
  const uniqueStores = carts.map((x) => x.store_id).filter((x, i, a) => a.indexOf(x) == i);

  await asyncForEach(uniqueStores, async (store_id) => {
    const storeCarts = carts.filter((c) => (c.store_id = store_id));
    const variation_ids = storeCarts.map((c) => c.variation_id);

    total += await getStoreShipping(store_id, variation_ids, address_id);
  });

  return total;
}

async function getStoreShipping(store_id: string, variation_ids: string[], address_id: string) {
  //--> address_id {USER ADDRESS ID}
  return Promise.resolve(0);
}

export default {
  getTotalShipping,
  getStoreShipping,
};
