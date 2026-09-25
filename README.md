# prefetchview

浏览器单页工作台（原生 ES 模块，零依赖）。

## 起服务看页面

    python3 -m http.server 8000

浏览器打开 http://127.0.0.1:8000/ ，改样例点运行看结果。

## 测试

    node tests/run.js

## 场景自检

    node check_sample.js

## 语义

- `cache.touch(cache, key)`：缓存按最近使用排序（队首最久、队尾最近）。
  命中则把键挪到队尾并返回 `hit: true`；未命中则装入，容量不足时淘汰队首并在
  `evicted` 给出被淘汰的键。容量通过 `cache.capacity` 携带。
- `prefetch.plan(accesses, index, distance, budget, cache)`：从 `index` 向后
  最多看 `distance` 个键，只取窗口内不在缓存的键，先到先得最多 `budget` 个记入
  `prefetch` 并装入缓存；超出预算或因“当前键不得被挤出”而无法装入的候选记入
  `deferred`，不静默丢弃。预取淘汰同样按 LRU，但跳过当前访问键。
- 容量为 0 时 `touch`、`plan`、`render` 抛出错误码 `E_NO_CAPACITY`。
- 每个位置只扫描长度为 `distance` 的窗口，复杂度 O(n·distance)。
