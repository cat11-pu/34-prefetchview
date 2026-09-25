// cache.js：LRU 缓存与淘汰
export const NO_CAPACITY = "E_NO_CAPACITY";

export function noCapacityError() {
  const error = new Error(NO_CAPACITY);
  error.code = NO_CAPACITY;
  return error;
}

function capacityOf(cache) {
  return typeof cache.capacity === "number" ? cache.capacity : Infinity;
}

export function touch(cache, key) {
  const capacity = capacityOf(cache);
  if (capacity <= 0) throw noCapacityError();
  const next = cache.slice();
  next.capacity = cache.capacity;
  const prefetched = new Set(cache.prefetched);
  next.prefetched = prefetched;
  const at = next.indexOf(key);
  if (at !== -1) {
    next.splice(at, 1);
    next.push(key);
    return { cache: next, hit: true, evicted: null };
  }
  prefetched.delete(key);
  next.push(key);
  let evicted = null;
  while (next.length > capacity) {
    evicted = next.shift();
    prefetched.delete(evicted);
  }
  return { cache: next, hit: false, evicted: evicted };
}
