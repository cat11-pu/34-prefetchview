import fs from "node:fs";
import { touch } from "./cache.js";
import { plan } from "./prefetch.js";
import { render } from "./app.js";

const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/prefetch.json", "utf8"));
let cache = [];
cache.capacity = spec.capacity;
let hits = 0;
let prefetchHits = 0;
const evicted = [];
let deferred = [];
for (let index = 0; index < spec.accesses.length; index += 1) {
  const key = spec.accesses[index];
  const result = touch(cache, key);
  cache = result.cache;
  if (result.hit) hits += 1;
  if (result.evicted) evicted.push(result.evicted);
  const planned = plan(spec.accesses, index, spec.distance, spec.budget, cache);
  if (planned.evicted) evicted.push(...planned.evicted);
  if (planned.prefetch.some((item) => item === spec.accesses[index + 1])) prefetchHits += 1;
  deferred = deferred.concat(planned.deferred);
}
const out = render(spec);

console.log("命中数 =", hits);
console.log("未命中数 =", spec.accesses.length - hits);
console.log("被淘汰的键 =", JSON.stringify(evicted));
console.log("预取进来的键数 =", cache.length);
console.log("预取命中次数 =", prefetchHits);
console.log("被推迟的预取 =", JSON.stringify(deferred));
console.log("容量 =", spec.capacity);
console.log("容量为零的错误码 =", spec.no_capacity_code);
