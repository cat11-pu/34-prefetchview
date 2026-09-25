// prefetch.js：基于距离窗口的预取。
// 从 current 向后最多看 distance 个键：不在缓存里的候选先到先得，
// 最多预算 budget 个真正取入；其余候选记入 deferred，不静默丢弃。
// 预取同样占容量；容量满时按 LRU 淘汰，但正在访问的键不得被挤出。
import { NoCapacityError } from "./cache.js";

export function plan(accesses, current, distance, budget, cache) {
  const capacity = cache.capacity;
  if (capacity !== undefined && capacity <= 0) {
    throw new NoCapacityError();
  }
  const look = Math.max(0, distance | 0);
  const quota = budget === undefined || budget === null
    ? 0
    : Math.max(0, budget | 0);
  const currentKey = accesses[current];
  const deferred = [];
  const evicted = [];
  const prefetch = [];
  const stop = Math.min(accesses.length, current + 1 + look);
  const candidates = [];
  for (let index = current + 1; index < stop; index += 1) {
    const key = accesses[index];
    if (key === currentKey || cache.indexOf(key) !== -1) continue;
    if (candidates.indexOf(key) !== -1) continue;
    candidates.push(key);
  }
  for (const key of candidates) {
    if (prefetch.length >= quota) {
      deferred.push(key);
      continue;
    }
    if (capacity !== undefined && cache.length >= capacity) {
      let victimAt = -1;
      for (let at = 0; at < cache.length; at += 1) {
        if (cache[at] !== currentKey) { victimAt = at; break; }
      }
      if (victimAt === -1) {
        deferred.push(key);
        continue;
      }
      const evictedKey = cache.splice(victimAt, 1)[0];
      evicted.push(evictedKey);
    }
    cache.push(key);
    prefetch.push(key);
  }
  return { prefetch, deferred, evicted };
}
