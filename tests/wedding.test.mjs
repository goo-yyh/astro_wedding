import test from "node:test";
import assert from "node:assert/strict";
import {
  birthday,
  calculate,
  dateRange,
  dateReport,
  scoreLabel,
  initialSettings,
  intervals,
} from "../src/wedding/calendar.ts";

const bride = { kind: "公历", value: "1994-05-12", leap: false };
const groom = { kind: "公历", value: "1995-09-18", leap: false };
function just(rule) {
  const settings = initialSettings();
  for (const key of Object.keys(settings.levels)) settings.levels[key] = "off";
  settings.levels[rule] = "must";
  return settings;
}
test("未填的长辈留待核对，已知冲突优先排除，补全后才正式推荐", () => {
  const settings = just("parents");
  settings.parents[0].value = "10-02";
  const dates = ["2027-10-01", "2027-10-02"];
  const partial = calculate(dates, bride, groom, settings);
  assert.deepEqual(
    partial.map((x) => x.status),
    ["待核对", "已排除"],
  );
  assert.match(partial[0].rows.find((x) => x.id === "parents").detail, /1\/4/);
  for (const p of settings.parents.slice(1)) p.value = "01-11";
  assert.deepEqual(
    calculate(dates, bride, groom, settings).map((d) => d.status),
    ["可推荐", "已排除"],
  );
});
test("周六要求与酒店周日档期冲突时不自动放宽", () => {
  const s = just("week");
  s.weekdays = [6];
  s.schedules.push({
    key: "hotel",
    name: "酒店",
    include: true,
    level: "must",
    dates: "2027-10-03",
  });
  const dates = ["2027-10-02", "2027-10-03"];
  assert.ok(
    calculate(dates, bride, groom, s).every((d) => d.status === "已排除"),
  );
  s.levels.week = "prefer";
  assert.equal(
    calculate(dates, bride, groom, s).find((x) => x.date === dates[1]).status,
    "可推荐",
  );
});
test("闰月与农历新年边界按约定换算", () => {
  assert.equal(
    birthday({ kind: "农历", value: "2023-02-01", leap: true })
      .getSolar()
      .toYmd(),
    "2023-03-22",
  );
  assert.throws(() =>
    birthday({ kind: "农历", value: "2023-03-01", leap: true }),
  );
  assert.equal(
    birthday({ ...bride, value: "2024-02-09" }).getYearShengXiao(),
    "兔",
  );
  assert.equal(
    birthday({ ...bride, value: "2024-02-10" }).getYearShengXiao(),
    "龙",
  );
});
test("四离四绝检查节气前一公历日", () => {
  for (const [id, date] of [
    ["li", "2024-03-19"],
    ["jue", "2024-02-03"],
  ])
    assert.equal(calculate([date], bride, groom, just(id))[0].status, "已排除");
});
test("跨年与闰日逐日生成，无效日期和倒序区间提示纠正", () => {
  assert.deepEqual(dateRange("2027-12-31", "2028-01-01"), [
    "2027-12-31",
    "2028-01-01",
  ]);
  assert.equal(dateRange("2028-02-28", "2028-03-01").length, 3);
  assert.throws(() => intervals("2027-02-29"));
  assert.throws(() => intervals("2027-04-03~2027-04-01"));
});

test("十二生肖按固定月表取大利、小利，其余月份不能通过硬要求", () => {
  const pairs = [
    [6, 1],
    [5, 4],
    [2, 3],
    [1, 6],
    [4, 5],
    [3, 2],
    [6, 1],
    [5, 4],
    [2, 3],
    [1, 6],
    [4, 5],
    [3, 2],
  ];
  for (let i = 0; i < 12; i++) {
    const s = just("month"),
      b = { ...bride, value: 1996 + i + "-06-01" };
    for (let m = 1; m <= 12; m++) {
      const date = birthday({
        kind: "农历",
        value: "2024-" + String(m).padStart(2, "0") + "-15",
        leap: false,
      })
        .getSolar()
        .toYmd();
      for (const allowSmall of [true, false]) {
        s.small = allowSmall;
        const isBig = ((m - 1) % 6) + 1 === pairs[i][0],
          isSmall = ((m - 1) % 6) + 1 === pairs[i][1];
        assert.equal(
          calculate([date], b, groom, s)[0].status,
          isBig || (allowSmall && isSmall) ? "可推荐" : "已排除",
          b.value + " / " + date,
        );
      }
    }
  }
});
test("百分制手算、未知偏好不扣分、组内多项不放大权重", () => {
  const s = just("month");
  s.levels.month = "prefer";
  s.levels.week = "prefer";
  s.weekdays = [5];
  s.levels.san = "prefer";
  s.levels.yang = "prefer";
  s.levels.parents = "prefer";
  // 属兔，农历六月初七，小利月 50%；传统组 (0+100)/2；周五 100%。合计 67。
  const [d] = calculate(
    ["2024-07-12"],
    { ...bride, value: "1999-06-01" },
    groom,
    s,
  );
  assert.equal(d.lunar, "六月初七");
  assert.deepEqual(
    d.breakdown.map((r) => r.points),
    [50, 50, 100],
  );
  assert.equal(d.score, 67);
  assert.equal(scoreLabel(d), "67 / 100 分");
  s.levels.parents = "must";
  const [p] = calculate([d.date], bride, groom, s);
  assert.deepEqual([p.status, p.score], ["待核对", null]);
  s.parents[0].value = "07-12";
  const [x] = calculate([d.date], bride, groom, s);
  assert.deepEqual([x.status, x.score], ["已排除", null]);
});
test("最高分并列选早日；零分可比较；全关闭或都待定时没有首选", () => {
  const dates = ["2027-10-04", "2027-10-03", "2027-10-02"];
  const s = just("week");
  s.weekdays = [0, 6];
  s.levels.week = "prefer";
  let report = dateReport(calculate(dates, bride, groom, s));
  assert.deepEqual(
    [report.recommendedDate, report.topScore, report.tiedDates],
    ["2027-10-02", 100, ["2027-10-02", "2027-10-03"]],
  );
  s.weekdays = [5];
  report = dateReport(calculate(dates, bride, groom, s));
  assert.equal(report.topScore, 0);
  assert.equal(report.recommendedDate, "2027-10-02");
  s.levels.week = "off";
  assert.equal(
    dateReport(calculate(dates, bride, groom, s)).recommendedDate,
    null,
  );
  s.levels.parents = "must";
  assert.equal(dateReport(calculate(dates, bride, groom, s)).topScore, null);
  s.levels.parents = "off";
  s.levels.week = "must";
  s.weekdays = [6];
  report = dateReport(calculate(dates, bride, groom, s));
  assert.equal(report.topScore, 100);
  assert.equal(report.tiedDates.length, 1);
});
test("普通农历生日与闰月生日分别匹配；仅限或排除档期均包含首尾", () => {
  const s = just("parents");
  s.parents = [{ name: "长辈", enabled: true, kind: "农历", value: "02-01" }];
  const dates = ["2023-02-20", "2023-03-22"];
  assert.equal(
    calculate(dates, bride, groom, s).find((d) => d.status === "已排除").date,
    dates[0],
  );
  s.parents[0].kind = "闰月";
  assert.equal(
    calculate(dates, bride, groom, s).find((d) => d.status === "已排除").date,
    dates[1],
  );
  s.levels.parents = "off";
  s.schedules = [
    {
      key: "x",
      name: "家人日期",
      dates: "2027-10-02 至 2027-10-04",
      include: false,
      level: "must",
    },
  ];
  for (const include of [false, true]) {
    s.schedules[0].include = include;
    const result = calculate(
      dateRange("2027-10-01", "2027-10-05"),
      bride,
      groom,
      s,
    );
    assert.deepEqual(
      result.filter((d) => d.status === "可推荐").map((d) => d.date.slice(-2)),
      include ? ["02", "03", "04"] : ["01", "05"],
    );
  }
});

test("全年逐日核对黄历宜忌、不将、建除、生肖日冲与两种固定避日表", () => {
  const dates = dateRange("2027-01-01", "2027-12-31"),
    s = initialSettings();
  const rows = calculate(dates, bride, groom, s);
  const yang = [
    [1, 13],
    [2, 11],
    [3, 9],
    [4, 7],
    [5, 5],
    [6, 3],
    [7, 1],
    [7, 29],
    [8, 27],
    [9, 25],
    [10, 23],
    [11, 21],
    [12, 19],
  ];
  const observed = new Set();
  for (const day of rows) {
    const lunar = birthday({ ...bride, value: day.date }),
      row = Object.fromEntries(day.rows.map((x) => [x.id, x.value]));
    const cyc = "鼠牛虎兔龙蛇马羊猴鸡狗猪";
    const base = Date.UTC(2000, 0, 7); // 甲子日，冲马
    const delta = (Date.parse(day.date) - base) / 86400000;
    const clash = cyc[(delta + 6) % 12];
    assert.equal(row.clash, Number(!["狗", "猪"].includes(clash)), day.date);
    assert.equal(
      row.yi,
      Number(
        lunar.getDayYi().includes("嫁娶") && !lunar.getDayJi().includes("嫁娶"),
      ),
    );
    assert.equal(row.bu, Number(lunar.getDayJiShen().includes("不将")));
    assert.equal(
      row.star,
      Number(["成", "开", "定", "满"].includes(lunar.getZhiXing())),
    );
    assert.equal(
      row.san,
      Number(![3, 7, 13, 18, 22, 27].includes(lunar.getDay())),
    );
    assert.equal(
      row.yang,
      Number(
        !yang.some(([m, d]) => m === lunar.getMonth() && d === lunar.getDay()),
      ),
    );
    assert.equal(day.status, row.yi && row.clash ? "可推荐" : "已排除");
    for (const key of ["clash", "yi", "bu", "star", "san", "yang"])
      observed.add(key + row[key]);
  }
  assert.equal(observed.size, 12);
});
