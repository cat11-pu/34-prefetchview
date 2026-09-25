import assert from "node:assert";
import { touch } from "../cache.js";
import { plan } from "../prefetch.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("touch reports hit flag", () => {
  assert.strictEqual(typeof touch([], "a").hit, "boolean");
});

check("touch returns evicted slot", () => {
  assert.ok(touch([], "a").evicted === null || typeof touch([], "a").evicted === "string");
});

check("plan returns prefetch list", () => {
  assert.ok(Array.isArray(plan(["a", "b"], 0, 2, 3, []).prefetch));
});

check("plan returns deferred list", () => {
  assert.ok(Array.isArray(plan(["a", "b"], 0, 2, 3, []).deferred));
});

check("render exposes hits", () => {
  assert.strictEqual(typeof render({ accesses: ["a"], capacity: 4, distance: 2, budget: 2 }).hits, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
