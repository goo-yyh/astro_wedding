import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import {
  ids,
  intervals,
  levels,
  dateReport,
  solar,
} from "../../wedding/calendar";
import type { Comparison, Proposal } from "../../wedding/analysis";

export const prerender = false;
const requests = new Map<string, { until: number; count: number }>();
function allowed(ip: string) {
  const now = Date.now();
  for (const [key, value] of requests)
    if (value.until <= now) requests.delete(key);
  const limit = requests.get(ip) ?? { until: now + 60000, count: 0 };
  requests.set(ip, limit);
  return ++limit.count <= 12;
}
const json = (value: unknown, status = 200) =>
  Response.json(
    status === 200
      ? { version: 1, ok: true, data: value, error: null }
      : {
          version: 1,
          ok: false,
          data: null,
          error: {
            code: status,
            message:
              status === 429
                ? "请求较多，请稍后再试。"
                : status === 400
                  ? "请检查输入和日期，再试一次。"
                  : "暂时无法生成解读，可重试或手动设置条件。",
          },
        },
    { status, headers: { "Cache-Control": "no-store" } },
  );
const short = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.length <= max;
const notePrompt =
  '将婚期备注提取为 JSON {"items":[{"type":"week","name":"仅周六","level":"must","weekdays":[6]}]}。type 可选 yi 黄历宜嫁娶、clash 双方避冲、month 行嫁月(small 表示接受小利月)、san 三娘、yang 杨公、li 四离、jue 四绝、bu 不将、star 建除、parents 父母生日、week 星期(0日到6六)、schedule 档期、question 待确认问题。level 为 must / prefer / off。明确必须、只可、不能为 must，希望、最好为 prefer。schedule 的 include=true 仅限这些日期，false 避开。dates 格式 YYYY-MM-DD 或 YYYY-MM-DD~YYYY-MM-DD，多项逗号分隔。只从备注与明确的搜索范围推断年份。模糊节日、缺日期、无法表达的条件或歧义输出 question，用 name 提出具体问题；不要编造日期或人名。每个独立要求一行，最多 12 行。name 用简短中文。';
const comparePrompt =
  '你在解释两个候选婚期。只从输入中的 facts 选择最值得对照的 id，优先硬条件冲突、资料缺口、其次是偏好差异。输出 JSON {"focus":["id",...]}，1至4个，无差异时选有代表性的项。不重新推算，不生成日期或自由结论。';
function cleanNotes(raw: unknown): Proposal[] {
  if (!Array.isArray(raw) || raw.length > 12) throw Error();
  return raw.map((p) => {
    if (
      !p ||
      ![...ids, "schedule", "question"].includes(p.type) ||
      !short(p.name, 120) ||
      !p.name.trim()
    )
      throw Error();
    const level = Object.hasOwn(levels, p.level) ? p.level : "prefer";
    const weekdays = Array.isArray(p.weekdays)
      ? [
          ...new Set<number>(
            p.weekdays.filter(
              (n: unknown) =>
                Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 6,
            ),
          ),
        ]
      : [];
    let type = p.type;
    let dates = typeof p.dates === "string" ? p.dates : "";
    if (type === "schedule") {
      try {
        if (
          !dates ||
          dates.length > 500 ||
          typeof p.include !== "boolean" ||
          !intervals(dates).length
        )
          type = "question";
      } catch {
        type = "question";
        dates = "";
      }
    }
    if (type === "week" && !weekdays.length && level !== "off")
      type = "question";
    return {
      type,
      name: p.name,
      level,
      weekdays,
      dates,
      include: p.include === true,
      small: p.small === true,
    };
  });
}
function validCompare(input: Comparison) {
  return (
    Array.isArray(input.dates) &&
    input.dates.length === 2 &&
    input.dates.every(
      (d) =>
        d &&
        short(d.date, 10) &&
        solar(d.date).toYmd() === d.date &&
        ["可推荐", "待核对", "已排除"].includes(d.status) &&
        (d.score === null ||
          (d.status === "可推荐" &&
            Number.isInteger(d.score) &&
            d.score >= 0 &&
            d.score <= 100)),
    ) &&
    input.dates[0].date !== input.dates[1].date &&
    Array.isArray(input.facts) &&
    input.facts.length > 0 &&
    input.facts.length <= 40 &&
    input.facts.every(
      (f) =>
        f &&
        short(f.id, 64) &&
        short(f.label, 100) &&
        short(f.a, 240) &&
        short(f.b, 240) &&
        short(f.level, 10),
    )
  );
}
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "none"].includes(site)) return json({}, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({}, 415);
  if (!allowed(clientAddress)) return json({}, 429);
  const deepseek_key = getSecret("deepseek_key");
  if (!deepseek_key) return json({}, 503);
  let mode: string, data: unknown, compare: Comparison | undefined;
  try {
    if (Number(request.headers.get("content-length")) > 24000)
      return json({}, 413);
    const body = await request.text();
    if (body.length > 24000) return json({}, 413);
    const input = JSON.parse(body);
    mode = input.mode;
    if (
      mode === "notes" &&
      short(input.note, 1000) &&
      input.note.trim() &&
      short(input.range, 1100)
    )
      data = { note: input.note, range: input.range };
    else if (
      mode === "compare" &&
      input.comparison &&
      validCompare(input.comparison)
    ) {
      compare = input.comparison;
      data = {
        ...dateReport(input.comparison.dates),
        facts: input.comparison.facts,
      };
    } else return json({}, 400);
  } catch {
    return json({}, 400);
  }
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + deepseek_key,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(32000),
      body: JSON.stringify({
        model: "deepseek-flash",
        thinking: { type: "disabled" },
        temperature: 0,
        response_format: { type: "json_object" },
        max_tokens: 1400,
        messages: [
          {
            role: "system",
            content: mode === "notes" ? notePrompt : comparePrompt,
          },
          { role: "user", content: JSON.stringify(data) },
        ],
      }),
    });
    if (!res.ok) return json({}, res.status === 429 ? 429 : 502);
    const result = JSON.parse((await res.json()).choices[0].message.content);
    if (!compare) return json({ items: cleanNotes(result.items) });
    const known = new Set(compare.facts.map((f) => f.id));
    if (
      !Array.isArray(result.focus) ||
      !result.focus.length ||
      result.focus.length > 4 ||
      !result.focus.every(
        (id: unknown) => typeof id === "string" && known.has(id),
      )
    )
      return json({}, 502);
    return json({
      ...dateReport(compare.dates),
      focus: [...new Set(result.focus)],
    });
  } catch {
    return json({}, 502);
  }
};
