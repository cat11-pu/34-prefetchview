// app.js：渲染结果
import { touch, noCapacityError } from "./cache.js";
import { plan } from "./prefetch.js";

export function render(spec) {
  if (!(spec.capacity > 0)) throw noCapacityError();
  let cache = [];
  cache.capacity = spec.capacity;
  let hits = 0;
  let prefetchHits = 0;
  let deferred = 0;
  const evicted = [];
  const accesses = spec.accesses;
  for (let index = 0; index < accesses.length; index += 1) {
    const key = accesses[index];
    const result = touch(cache, key);
    cache = result.cache;
    if (result.hit) {
      hits += 1;
      if (cache.prefetched.has(key)) prefetchHits += 1;
    }
    if (result.evicted) evicted.push(result.evicted);
    const planned = plan(accesses, index, spec.distance, spec.budget, cache);
    evicted.push(...planned.evicted);
    deferred += planned.deferred.length;
  }
  return { hits: hits, misses: accesses.length - hits, evicted: evicted,
           prefetched: cache.length, prefetch_hits: prefetchHits, deferred: deferred,
           capacity: spec.capacity };
}
