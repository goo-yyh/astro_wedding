// Live smoke test. Run against your own local server with its DeepSeek key configured.
import assert from "node:assert/strict";
import {
  calculate,
  initialSettings,
  recommendation,
  verdict,
} from "../src/wedding/calendar.ts";
const endpoint = new URL(
  "/api/analysis",
  process.env.WEDDING_TEST_URL || "http://127.0.0.1:4321",
);
async function post(input, status = 200) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(40000),
  });
  assert.equal(r.status, status);
  const b = await r.json();
  assert.equal(b.version, 1);
  assert.equal(b.ok, status === 200);
  if (status !== 200) {
    assert.equal(b.data, null);
    assert.equal(b.error.code, status);
  } else assert.equal(b.error, null);
  return b.data;
}
const range = "2027-10-01 至 2027-10-31";
const { items } = await post({
  mode: "notes",
  range,
  note: "最好周六；酒店只剩2027年10月2日和10月3日，两天任选其一。",
});
assert.ok(
  items.some(
    (i) =>
      i.type === "week" && i.level === "prefer" && i.weekdays.join() === "6",
  ),
);
const available = items.filter((i) => i.type === "schedule");
assert.equal(available.length, 1);
assert.ok(
  available[0].include &&
    available[0].level === "must" &&
    available[0].dates.includes("2027-10-02") &&
    available[0].dates.includes("2027-10-03"),
);
console.log("PASS 同一酒店两个备选日、周六偏好", JSON.stringify(items));
const unclear = await post({
  mode: "notes",
  range,
  note: "外婆必须到场，她能来的日期还没确定。",
});
assert.ok(unclear.items.some((x) => x.type === "question"));
assert.ok(!unclear.items.some((x) => x.type === "schedule" && x.dates));
console.log("PASS 未知出席日期保留待确认", JSON.stringify(unclear.items));
const s = initialSettings();
const [a, b] = calculate(
  ["2027-01-23", "2027-01-24"],
  { kind: "公历", value: "1994-05-12", leap: false },
  { kind: "公历", value: "1995-09-18", leap: false },
  s,
);
const dates = [a, b].map(({ date, status, score }) => ({
  date,
  status,
  score,
}));
const facts = a.rows
  .filter((r) => r.level !== "off")
  .map((r) => {
    const other = b.rows.find((x) => x.id === r.id);
    return {
      id: r.id,
      label: r.label,
      level: r.level,
      a: verdict(r) + " · " + r.detail,
      b: verdict(other) + " · " + other.detail,
    };
  });
const out = await post({ mode: "compare", comparison: { dates, facts } });
for (const [k, v] of Object.entries(recommendation(dates)))
  assert.deepEqual(out[k], v);
assert.deepEqual(out.dates, dates);
assert.ok(
  out.focus.length && out.focus.every((id) => facts.some((f) => f.id === id)),
);
console.log("PASS 真实比较沿用程序评分、首选和依据", JSON.stringify(out));
await post({ mode: "notes", note: "", range }, 400);
await post(
  { mode: "compare", comparison: { dates: [dates[0], dates[0]], facts } },
  400,
);
console.log("PASS 两类无效输入返回统一错误格式");
