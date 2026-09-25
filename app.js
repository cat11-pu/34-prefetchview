// app.js：渲染结果
import { touch } from "./cache.js";
import { plan } from "./prefetch.js";

export function render(spec) {
  if (spec.capacity !== undefined && spec.capacity <= 0) {
    const error = new Error("cache capacity is zero");
    error.code = "E_NO_CAPACITY";
    throw error;
  }
  const cache = [];
  cache.capacity = spec.capacity;
  let hits = 0;
  let prefetchHits = 0;
  const evicted = [];
  const deferred = [];
  const accesses = spec.accesses;
  for (let index = 0; index < accesses.length; index += 1) {
    const key = accesses[index];
    const result = touch(cache, key);
    if (result.hit) hits += 1;
    if (result.evicted) evicted.push(result.evicted);
    const planned = plan(accesses, index, spec.distance || 0, spec.budget || 0, cache);
    for (const key of planned.evicted) evicted.push(key);
    for (const key of planned.deferred) deferred.push(key);
    const nextKey = accesses[index + 1];
    if (nextKey !== undefined && cache.indexOf(nextKey) !== -1) prefetchHits += 1;
  }
  return { hits: hits, misses: accesses.length - hits, evicted: evicted,
           prefetched: cache.length, prefetch_hits: prefetchHits, deferred: deferred,
           capacity: spec.capacity };
}
