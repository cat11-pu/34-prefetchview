// prefetch.js：距离预取（基线：不预取）
export function plan(next, current, distance, budget, cache) {
  return { prefetch: [], deferred: [] };
}
