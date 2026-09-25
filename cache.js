// cache.js：LRU 缓存与淘汰。
// cache 为按最近使用排序的数组：索引 0 最久未使用，末尾最近使用。
// 容量通过 cache.capacity 携带（touch/plan 签名固定，无法另传容量）。

export class NoCapacityError extends Error {
  constructor(message) {
    super(message || "cache capacity is zero");
    this.name = "NoCapacityError";
    this.code = "E_NO_CAPACITY";
  }
}

export function touch(cache, key) {
  const capacity = cache.capacity;
  if (capacity !== undefined && capacity <= 0) {
    throw new NoCapacityError();
  }
  const at = cache.indexOf(key);
  if (at !== -1) {
    cache.splice(at, 1);
    cache.push(key);
    return { cache, hit: true, evicted: null };
  }
  let evicted = null;
  if (capacity !== undefined && cache.length >= capacity) {
    evicted = cache.shift();
  }
  cache.push(key);
  return { cache, hit: false, evicted };
}
