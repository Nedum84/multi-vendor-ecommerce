import { CartInstance } from "../ec-cart/model";

async function getTotalShipping(carts: CartInstance[], address_id: string) {
  const cartsClone = carts.map((cart) => Object.assign({}, cart));

  let total = 0;
  const uniqueStores = cartsClone.map((x) => x.store_id).filter((x, i, a) => a.indexOf(x) == i);

  for await (const storeId of uniqueStores) {
    const storeCarts = cartsClone.filter((c) => (c.store_id = storeId));
    const variationIds = storeCarts.map((c) => c.variation_id);

    total += await getStoreShipping(storeId, variationIds, address_id);
  }

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
