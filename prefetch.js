// prefetch.js：距离预取
import { noCapacityError } from "./cache.js";

export function plan(accesses, index, distance, budget, cache) {
  const capacity = typeof cache.capacity === "number" ? cache.capacity : Infinity;
  const prefetched = cache.prefetched instanceof Set ? cache.prefetched : new Set();
  const current = accesses[index];
  const seen = new Set();
  const candidates = [];
  for (let offset = 1; offset <= distance && index + offset < accesses.length; offset += 1) {
    const key = accesses[index + offset];
    if (seen.has(key)) continue;
    seen.add(key);
    if (!cache.includes(key) || prefetched.has(key)) candidates.push(key);
  }
  const prefetch = candidates.slice(0, budget);
  const deferred = candidates.slice(budget).filter((key) => !cache.includes(key));
  const loaded = [];
  const evicted = [];
  for (const key of prefetch.slice()) {
    if (cache.includes(key)) continue;
    if (capacity <= 0) throw noCapacityError();
    cache.push(key);
    prefetched.add(key);
    loaded.push(key);
    while (cache.length > capacity) {
      const victim = cache.findIndex((item) => item !== current && !loaded.includes(item));
      if (victim === -1) {
        cache.splice(cache.indexOf(key), 1);
        prefetched.delete(key);
        loaded.splice(loaded.indexOf(key), 1);
        prefetch.splice(prefetch.indexOf(key), 1);
        deferred.push(key);
        break;
      }
      prefetched.delete(cache[victim]);
      evicted.push(cache[victim]);
      cache.splice(victim, 1);
    }
  }
  cache.prefetched = prefetched;
  return { prefetch: prefetch, deferred: deferred, evicted: evicted };
}
