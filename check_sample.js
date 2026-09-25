import fs from "node:fs";
import { render } from "./app.js";

const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/prefetch.json", "utf8"));
const out = render(spec);

console.log("命中数 =", out.hits);
console.log("未命中数 =", out.misses);
console.log("被淘汰的键 =", JSON.stringify(out.evicted));
console.log("预取进来的键数 =", out.prefetched);
console.log("预取命中次数 =", out.prefetch_hits);
console.log("被推迟的预取 =", JSON.stringify(out.deferred));
console.log("容量 =", spec.capacity);
let zeroCode = "(未抛出)";
try {
  render({ ...spec, capacity: 0 });
} catch (error) {
  zeroCode = error.code;
}
console.log("容量为零的错误码 =", zeroCode);
