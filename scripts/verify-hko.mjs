// Official text tables use the month name on its first day. A repeated month
// number denotes an intercalary month. December 2022 seeds January 2023.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  birthday,
  calculate,
  initialSettings,
  solar,
} from "../src/wedding/calendar.ts";

const firstYear = 2023,
  lastYear = 2029;
const rows = [];
let previousMonth,
  month,
  lunarYear,
  days = 0,
  terms = 0,
  intercalaryDays = 0;
const weeks = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
for (let year = firstYear - 1; year <= lastYear; year++) {
  const url =
    "https://www.hko.gov.hk/en/gts/time/calendar/text/files/T" + year + "e.txt";
  let file;
  if (process.env.HKO_TABLE_DIR)
    file = await readFile(
      process.env.HKO_TABLE_DIR + "/" + year + ".txt",
      "utf8",
    );
  else {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    assert.equal(r.status, 200);
    file = await r.text();
  }
  for (const line of file.split(/\r?\n/)) {
    if (!/^\d{4}\//.test(line)) continue;
    const [date, dayLabel, week, term = ""] = line.trim().split(/\s{2,}/);
    const iso = date
      .split("/")
      .map((p) => p.padStart(2, "0"))
      .join("-");
    const first = /^(\d+)(?:st|nd|rd|th) Lunar Month/i.exec(dayLabel);
    if (first) {
      const number = Number(first[1]);
      month = previousMonth === number ? -number : number;
      previousMonth = number;
      if (month === 1) lunarYear = year;
    }
    if (year < firstYear) continue;
    const day = first ? 1 : Number(dayLabel);
    const civil = solar(iso),
      lunar = civil.getLunar();
    assert.deepEqual(
      [
        lunar.getYear(),
        lunar.getMonth(),
        lunar.getDay(),
        weeks[civil.getWeek()],
      ],
      [lunarYear, month, day, week],
      iso,
    );
    const value = [lunarYear, Math.abs(month), day]
      .map((x) => String(x).padStart(2, "0"))
      .join("-");
    assert.equal(
      birthday({ kind: "农历", value, leap: month < 0 })
        .getSolar()
        .toYmd(),
      iso,
      iso,
    );
    if (month < 0) intercalaryDays++;
    rows.push({ date: iso, term });
    days++;
  }
}
assert.equal(days, 2557);
const bride = { kind: "公历", value: "1994-05-12", leap: false },
  groom = { ...bride, value: "1995-09-18" };
const li = [],
  jue = [];
for (const r of rows) {
  if (/Equinox|Solstice/.test(r.term)) li.push(solar(r.date).next(-1).toYmd());
  if (/Commences/.test(r.term)) jue.push(solar(r.date).next(-1).toYmd());
}
assert.equal(li.length, 28);
assert.equal(jue.length, 28);
const actual = { li: [], jue: [] };
for (let i = 0; i < rows.length; i += 366) {
  const report = calculate(
    rows.slice(i, i + 366).map((d) => d.date),
    bride,
    groom,
    initialSettings(),
  );
  for (const d of report)
    for (const key of ["li", "jue"])
      if (d.rows.find((r) => r.id === key).value === 0)
        actual[key].push(d.date);
}
assert.deepEqual(actual.li.sort(), li.sort());
assert.deepEqual(actual.jue.sort(), jue.sort());
terms = li.length + jue.length;
console.log(
  JSON.stringify({
    years: [firstYear, lastYear],
    days,
    intercalaryDays,
    termEves: terms,
    mismatches: 0,
  }),
);
