import { Solar, Lunar, LunarMonth } from "lunar-typescript";

export type Level = "must" | "prefer" | "off";
export const levels = {
  must: "必须满足",
  prefer: "尽量满足",
  off: "不考虑",
} as const;
export const groups = [
  "黄历宜嫁娶",
  "新人生肖",
  "女方行嫁月",
  "传统择日",
  "家庭避日",
  "实际安排",
];
export const rules = {
  yi: ["黄历宜嫁娶", 0, "must"],
  clash: ["避开双方生肖冲日", 1, "must"],
  month: ["女方行嫁月", 2, "prefer"],
  san: ["避开三娘煞", 3, "prefer"],
  yang: ["避开杨公忌", 3, "prefer"],
  li: ["避开四离日", 3, "prefer"],
  jue: ["避开四绝日", 3, "prefer"],
  bu: ["优先不将日", 3, "prefer"],
  star: ["优先成、开、定、满日", 3, "prefer"],
  parents: ["避开父母生日", 4, "off"],
  week: ["婚礼星期", 5, "prefer"],
} as const;
export type RuleId = keyof typeof rules;
export const ids = Object.keys(rules) as RuleId[];
export type Birth = { kind: "公历" | "农历"; value: string; leap: boolean };
export type Parent = {
  name: string;
  enabled: boolean;
  kind: "公历" | "农历" | "闰月";
  value: string;
};
export type Schedule = {
  key: string;
  name: string;
  include: boolean;
  dates: string;
  level: Level;
};
export type Settings = {
  levels: Record<RuleId, Level>;
  weekdays: number[];
  small: boolean;
  parents: Parent[];
  schedules: Schedule[];
};
export function initialSettings(): Settings {
  return {
    levels: Object.fromEntries(
      ids.map((id) => [id, rules[id][2]]),
    ) as Settings["levels"],
    weekdays: [0, 6],
    small: false,
    schedules: [],
    parents: ["新娘父亲", "新娘母亲", "新郎父亲", "新郎母亲"].map((name) => ({
      name,
      enabled: true,
      kind: "公历",
      value: "",
    })),
  };
}
export const two = (n: number) => String(n).padStart(2, "0");
export function today() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function solar(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw Error("请使用 YYYY-MM-DD 格式填写日期。");
  const [y, m, d] = date.split("-").map(Number);
  if (
    y < 1900 ||
    y > 2100 ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > new Date(Date.UTC(y, m, 0)).getUTCDate()
  )
    throw Error("请输入 1900 至 2100 年内的有效日期。");
  return Solar.fromYmd(y, m, d);
}
export function birthday(b: Birth) {
  if (b.kind === "公历") return solar(b.value).getLunar();
  const [y, m, d] = b.value.split("-").map(Number);
  const month = y >= 1900 && y <= 2100 && LunarMonth.fromYm(y, b.leap ? -m : m);
  if (!month || !Number.isInteger(d) || d < 1 || d > month.getDayCount())
    throw Error("该农历生日不存在，请核对年份、月份和闰月。");
  return Lunar.fromYmd(y, month.getMonth(), d);
}
export function intervals(value: string) {
  if (!value.trim()) return [];
  return value
    .trim()
    .replace(/\s*([~～至])\s*/g, "$1")
    .split(/[,，;；\s]+/)
    .filter(Boolean)
    .map((part) => {
      const dates = part.split(/[~～至]/);
      const [start, end = start] = dates;
      solar(start);
      solar(end);
      if (dates.length > 2 || end < start)
        throw Error("日期区间结束日须在开始日之后。");
      return { start, end };
    });
}
export function dateRange(start: string, end: string) {
  const first = solar(start);
  solar(end);
  if (end < start) throw Error("结束日期不能早于开始日期。");
  const dates: string[] = [];
  for (let day = first; day.toYmd() <= end; day = day.next(1)) {
    if (dates.length >= 731) throw Error("单次最多比较两年的婚期。");
    dates.push(day.toYmd());
  }
  return dates;
}
export type Row = {
  id: string;
  label: string;
  group: number;
  level: Level;
  value: number | null;
  detail: string;
};
export type Status = "可推荐" | "待核对" | "已排除";
export type Candidate = {
  date: string;
  lunar: string;
  week: number;
  status: Status;
  score: number | null;
  breakdown: { group: string; points: number; checked: number }[];
  rows: Row[];
  yi: string[];
  ji: string[];
};
const monthPairs: Record<string, [number, number]> = {};
for (const [animals, big, small] of [
  ["鸡兔", 1, 6],
  ["虎猴", 2, 3],
  ["蛇猪", 3, 2],
  ["龙狗", 4, 5],
  ["牛羊", 5, 4],
  ["鼠马", 6, 1],
] as const)
  for (const animal of animals) monthPairs[animal] = [big, small];
const yangDays = new Set([
  "1-13",
  "2-11",
  "3-9",
  "4-7",
  "5-5",
  "6-3",
  "7-1",
  "7-29",
  "8-27",
  "9-25",
  "10-23",
  "11-21",
  "12-19",
]);
export function calculate(
  dates: string[],
  bride: Birth,
  groom: Birth,
  s: Settings,
) {
  const animals = [birthday(bride), birthday(groom)].map((b) =>
    b.getYearShengXiao(),
  );
  const [big, small] = monthPairs[animals[0]];
  const parents = s.parents.filter((p) => p.enabled);
  if (s.levels.parents !== "off")
    for (const p of parents) {
      if (!p.value) continue;
      if (!/^\d{2}-\d{2}$/.test(p.value))
        throw Error(p.name + "生日请填月日，如 08-16。");
      if (p.kind === "公历") solar("2000-" + p.value);
      else {
        const [m, d] = p.value.split("-").map(Number);
        if (m < 1 || m > 12 || d < 1 || d > 30)
          throw Error(p.name + "的农历月日无效。");
      }
    }
  const schedules = s.schedules.map((item) => ({
    ...item,
    windows: item.level === "off" ? [] : intervals(item.dates),
  }));
  return dates
    .map((date) => {
      const day = solar(date),
        l = day.getLunar(),
        week = day.getWeek();
      const m = l.getMonth(),
        d = l.getDay(),
        regular = Math.abs(m),
        half = ((regular - 1) % 6) + 1;
      const rows: Row[] = [];
      const add = (
        id: RuleId,
        value: number | null | boolean,
        detail: string,
      ) => {
        const [label, group] = rules[id];
        rows.push({
          id,
          label,
          group,
          level: s.levels[id],
          value: value === null ? null : Number(value),
          detail,
        });
      };
      const yi = l.getDayYi(),
        ji = l.getDayJi(),
        clash = l.getDayChongShengXiao();
      add(
        "yi",
        yi.includes("嫁娶") && !ji.includes("嫁娶"),
        ji.includes("嫁娶")
          ? "忌项列有嫁娶"
          : yi.includes("嫁娶")
            ? "宜项列有嫁娶"
            : "宜项未列嫁娶",
      );
      add(
        "clash",
        !animals.includes(clash),
        "当日冲" + clash + "；新娘属" + animals[0] + "，新郎属" + animals[1],
      );
      const monthValue =
        half === big
          ? 1
          : half === small
            ? s.levels.month === "must"
              ? Number(s.small)
              : 0.5
            : 0;
      add(
        "month",
        monthValue,
        "农历" +
          l.getMonthInChinese() +
          "月 · " +
          (half === big ? "大利月" : half === small ? "小利月" : "普通月份"),
      );
      add(
        "san",
        ![3, 7, 13, 18, 22, 27].includes(d),
        "农历" + l.getDayInChinese(),
      );
      const yang = m > 0 && yangDays.has(m + "-" + d);
      add("yang", !yang, yang ? "当日为杨公忌" : "未逢杨公忌");
      const term = day.next(1).getLunar().getJieQi();
      const li = ["春分", "夏至", "秋分", "冬至"].includes(term),
        jue = ["立春", "立夏", "立秋", "立冬"].includes(term);
      add("li", !li, li ? "次日为" + term : "未逢四离");
      add("jue", !jue, jue ? "次日为" + term : "未逢四绝");
      const bu = l.getDayJiShen().includes("不将");
      add("bu", bu, bu ? "吉神中列有不将" : "当日未列不将");
      const star = l.getZhiXing();
      add(
        "star",
        ["成", "开", "定", "满"].includes(star),
        "当日为" + star + "日",
      );
      const known = parents.filter((p) => p.value);
      const hits = known.filter((p) =>
        p.kind === "公历"
          ? date.slice(5) === p.value
          : (p.kind === "闰月" ? m < 0 : m > 0) &&
            p.value === two(regular) + "-" + two(d),
      );
      add(
        "parents",
        hits.length
          ? false
          : !parents.length || known.length < parents.length
            ? null
            : true,
        "已核对 " +
          known.length +
          "/" +
          parents.length +
          " 位" +
          (hits.length
            ? " · 与" + hits.map((p) => p.name).join("、") + "生日重合"
            : known.length
              ? "，已填者均未撞日"
              : ""),
      );
      add(
        "week",
        s.weekdays.includes(week),
        "当日为星期" + "日一二三四五六"[week],
      );
      for (const item of schedules) {
        const hit = item.windows.some((w) => date >= w.start && date <= w.end);
        rows.push({
          id: item.key,
          label: item.name || "家庭安排",
          level: item.level,
          group: item.include ? 5 : 4,
          value: item.windows.length ? Number(item.include === hit) : null,
          detail: !item.windows.length
            ? "待补日期"
            : item.include
              ? hit
                ? "在可用档期内"
                : "不在可用档期内"
              : hit
                ? "落在避让日期"
                : "已避开指定日期",
        });
      }
      const status: Status = rows.some(
        (r) => r.level === "must" && r.value === 0,
      )
        ? "已排除"
        : rows.some((r) => r.level === "must" && r.value === null)
          ? "待核对"
          : "可推荐";
      const grouped = groups
        .map((_, g) =>
          rows.filter(
            (r) => r.group === g && r.level === "prefer" && r.value !== null,
          ),
        )
        .filter((a) => a.length);
      const breakdown = grouped.map((items) => ({
        group: groups[items[0].group],
        points:
          (100 * items.reduce((sum, r) => sum + (r.value ?? 0), 0)) /
          items.length,
        checked: items.length,
      }));
      let score: number | null = null;
      if (status === "可推荐") {
        if (breakdown.length)
          score = Math.round(
            breakdown.reduce((sum, g) => sum + g.points, 0) / breakdown.length,
          );
        else if (
          rows.some((r) => r.level === "must") &&
          !rows.some((r) => r.level === "prefer")
        )
          score = 100;
      }
      return {
        date,
        lunar: l.getMonthInChinese() + "月" + l.getDayInChinese(),
        week,
        status,
        score,
        breakdown,
        rows,
        yi,
        ji,
      };
    })
    .sort(compareRatings);
}
export function verdict(r: Row) {
  return r.level === "off"
    ? "未启用"
    : r.value === null
      ? "待补资料"
      : r.value === 0
        ? "不符合"
        : r.value === 1
          ? "符合"
          : "部分符合";
}

export type Rating = Pick<Candidate, "date" | "status" | "score">;
function compareRatings(a: Rating, b: Rating) {
  return (b.score ?? -1) - (a.score ?? -1) || a.date.localeCompare(b.date);
}
export function recommendation(days: Rating[]) {
  const ranked = days
    .filter((d) => d.status === "可推荐" && d.score !== null)
    .sort(compareRatings);
  const best = ranked[0];
  return {
    recommendedDate: best?.date ?? null,
    topScore: best?.score ?? null,
    tiedDates: best
      ? ranked.filter((d) => d.score === best.score).map((d) => d.date)
      : [],
  };
}
export function scoreLabel(d: Rating) {
  if (d.score !== null) return d.score + " / 100 分";
  if (d.status === "已排除") return "不参与评分";
  if (d.status === "待核对") return "待补资料后评分";
  return "暂无评分依据";
}

// Shared by the full list and by a two-date analysis.
export function dateReport<T extends Rating>(dates: T[]) {
  return { dates, ...recommendation(dates) };
}
export type WeddingReport = ReturnType<typeof dateReport<Candidate>>;
