// cache.js：缓存与淘汰（基线：不淘汰、全部装下）
export function touch(cache, key) {
  const next = cache.slice();
  if (!next.includes(key)) next.push(key);
  return { cache: next, hit: false, evicted: null };
}
