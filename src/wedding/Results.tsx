import { useState } from "preact/hooks";
import {
  levels,
  recommendation,
  scoreLabel,
  type WeddingReport,
  verdict,
  solar,
  type Candidate,
  type Status,
  type Row,
} from "./calendar";
import { askAnalysis, type Comparison } from "./analysis";
import { Icon } from "./Fields";
const statuses: Status[] = ["可推荐", "待核对", "已排除"];
const color = (status: Status) =>
  ["good", "pending", "excluded"][statuses.indexOf(status)];
function explainChoice(left: Row, right: Row, dates: string[]) {
  if (left.value === null || right.value === null)
    return "这项资料尚未核对完整，补齐后再确定档期。";
  if (left.value === right.value)
    return left.detail === right.detail
      ? "两天在这一项上的结论相同。"
      : "两天在这项要求下并列，可按家庭安排取舍。";
  const stronger = left.value > right.value ? 0 : 1;
  return left.level === "must"
    ? dates[1 - stronger] + " 未通过这项必须条件。"
    : "如果更看重这项偏好，" + dates[stronger] + " 更合适。";
}
export function MonthGrid({
  month,
  days,
  pick,
}: {
  month: string;
  days: Map<string, Candidate>;
  pick: (d: Candidate) => void;
}) {
  const first = solar(month + "-01"),
    offset = (first.getWeek() + 6) % 7;
  const count = new Date(
    Date.UTC(first.getYear(), first.getMonth(), 0),
  ).getUTCDate();
  return (
    <div class="monthgrid">
      {Array.from("一二三四五六日", (x) => (
        <b>{x}</b>
      ))}
      {Array.from({ length: offset }, () => (
        <span />
      ))}
      {Array.from({ length: count }, (_, i) => {
        const date = first.next(i).toYmd(),
          day = days.get(date);
        return (
          <button
            type="button"
            disabled={!day}
            class={day ? color(day.status) : ""}
            aria-label={date + (day ? " " + day.status : "")}
            onClick={() => day && pick(day)}
          >
            {i + 1}
            {day && <i />}
          </button>
        );
      })}
    </div>
  );
}
function Compare({
  a,
  b,
  close,
}: {
  a: Candidate;
  b: Candidate;
  close: () => void;
}) {
  const [focus, setFocus] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const facts = a.rows.flatMap((r, i) =>
    r.level === "off"
      ? []
      : [
          {
            id: r.id,
            label: r.label,
            level: levels[r.level],
            a: verdict(r) + " · " + r.detail,
            b: verdict(b.rows[i]) + " · " + b.rows[i].detail,
          },
        ],
  );
  const comparison: Comparison = {
    dates: [a, b].map(({ date, status, score }) => ({ date, status, score })),
    facts,
  };
  const pair = recommendation([a, b]);
  const table = (same: boolean) => (
    <table class="compare-table">
      <thead>
        <tr>
          <th>核对项</th>
          <th>{a.date}</th>
          <th>{b.date}</th>
        </tr>
      </thead>
      <tbody>
        {facts
          .filter((f) => (f.a === f.b) === same)
          .map((f) => (
            <tr>
              <th>
                {f.label}
                <small>{f.level}</small>
              </th>
              <td>{f.a}</td>
              <td>{f.b}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
  return (
    <section class="panel comparison">
      <div class="title-row">
        <h2>两日比较</h2>
        <button onClick={close}>关闭比较</button>
      </div>
      <p>
        {a.date}（{a.status} · {scoreLabel(a)}） 与 {b.date}（{b.status} ·{" "}
        {scoreLabel(b)}）
      </p>
      <p>
        {pair.recommendedDate
          ? (pair.tiedDates.length > 1
              ? "两日同分，按日期先后首列 "
              : "这两天中更推荐 ") + pair.recommendedDate
          : "这两天暂时都不能列为首选。"}
      </p>
      {facts.some((f) => f.a !== f.b) ? (
        table(false)
      ) : (
        <p>两天已启用的规则明细相同。</p>
      )}
      <details>
        <summary>相同项 · {facts.filter((f) => f.a === f.b).length}</summary>
        {table(true)}
      </details>
      <button
        class="secondary"
        disabled={busy || !facts.length}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await askAnalysis<{ focus: string[] }>({
              mode: "compare",
              comparison,
            });
            setFocus(r.focus);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Icon name="spark" size={16} />
        {busy ? "正在比较…" : "请 AI 分析这两天"}
      </button>
      <div aria-live="polite">
        {error}
        {focus.length > 0 && (
          <div class="ai-advice">
            <h3>DeepSeek 建议重点比较</h3>
            {focus.map((id) => {
              const f = facts.find((x) => x.id === id)!;
              const index = a.rows.findIndex((x) => x.id === id);
              return (
                <p>
                  <strong>
                    {f.label} · {f.level}
                  </strong>
                  <br />
                  {f.a === f.b
                    ? "两天均为：" + f.a
                    : a.date +
                      "：" +
                      f.a +
                      "。" +
                      b.date +
                      "：" +
                      f.b +
                      "。"}{" "}
                  {explainChoice(a.rows[index], b.rows[index], [
                    a.date,
                    b.date,
                  ])}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
function Checklist({ day, modify }: { day: Candidate; modify: () => void }) {
  function row(r: Row) {
    return (
      <div class="check-row">
        <div>
          <strong>{r.label}</strong>
          <small>{r.level === "off" ? "本次未纳入" : r.detail}</small>
        </div>
        <div class="row-state">
          <span>{levels[r.level]}</span>
          <b
            class={
              r.level === "off"
                ? "excluded"
                : r.value === null
                  ? "pending"
                  : r.value === 1
                    ? "good"
                    : "excluded"
            }
          >
            {verdict(r)}
          </b>
        </div>
      </div>
    );
  }
  return (
    <div class="checklist">
      {day.score !== null && (
        <div class="breakdown">
          <strong>整体匹配分 · {scoreLabel(day)}</strong>
          {day.breakdown.map((g) => (
            <div>
              <span>{g.group}</span>
              <meter
                min="0"
                max="100"
                value={g.points}
                aria-label={g.group + "匹配率"}
              />
              <small>
                {Math.round(g.points)}% · {g.checked} 项
              </small>
            </div>
          ))}
          <small>
            {day.breakdown.length
              ? "各组先取组内平均，再按组等权计算总分。缺资料的偏好留待补充。"
              : "已满足全部必须条件，本次未启用偏好。"}
          </small>
        </div>
      )}
      {day.rows.filter((r) => r.level !== "off").map(row)}
      {day.rows.some((r) => r.level !== "off" && r.value === null) && (
        <button class="text-button" onClick={modify}>
          补充资料
        </button>
      )}
      <details>
        <summary>未启用项目及当天黄历</summary>
        {day.rows.filter((r) => r.level === "off").map(row)}
        <p>
          宜　{day.yi.join("、")}
          <br />
          忌　{day.ji.join("、")}
        </p>
        <small>历法来源 · lunar-typescript 1.8.6</small>
      </details>
    </div>
  );
}
function describeConflict(days: Candidate[]) {
  const example = days[0]?.rows ?? [];
  const weekday = example.find(
    (row) => row.id === "week" && row.level === "must",
  );
  if (!weekday) return "";
  for (const rule of example.filter(
    (row) => row.level === "must" && row.group === 5 && row.id !== "week",
  )) {
    const available = days.filter((day) =>
      day.rows.some((row) => row.id === rule.id && row.value === 1),
    );
    if (
      available.length &&
      available.every((day) =>
        day.rows.some((row) => row.id === "week" && row.value === 0),
      )
    ) {
      const weekdays = [
        ...new Set(available.map((day) => "周" + "日一二三四五六"[day.week])),
      ].join("、");
      return (
        "「" +
        rule.label +
        "」在本次范围内可用的 " +
        available.length +
        " 天为" +
        weekdays +
        "，均不符合必须遵循的星期要求。"
      );
    }
  }
  return "";
}
function coverage(day: Candidate) {
  const must = day.rows.filter((row) => row.level === "must");
  const missing = day.rows.filter(
    (row) => row.level !== "off" && row.value === null,
  );
  const prefs = day.rows.filter(
    (row) => row.level === "prefer" && row.value !== null,
  );
  return (
    "必须项 " +
    must.filter((row) => row.value === 1).length +
    "/" +
    must.length +
    " 符合 · 已核对偏好 " +
    prefs.filter((row) => row.value === 1).length +
    "/" +
    prefs.length +
    " 符合" +
    (missing.length ? " · " + missing.length + " 项待补" : "")
  );
}
export function Results({
  report,
  modify,
  initialDate,
}: {
  report: WeddingReport;
  modify: (advanced?: boolean, date?: string) => void;
  initialDate?: string;
}) {
  const days = report.dates;
  const first = days.find((x) => x.date === initialDate);
  const [filter, setFilter] = useState<Status>(
    first?.status ?? statuses.find((s) => days.some((d) => d.status === s))!,
  );
  const [all, setAll] = useState(Boolean(first)),
    [open, setOpen] = useState(first?.date ?? ""),
    [selected, setSelected] = useState<string[]>([]),
    [showCal, setShowCal] = useState(false);
  const ordered = [...days].map((d) => d.date).sort(),
    months = [...new Set(ordered.map((d) => d.slice(0, 7)))];
  const [month, setMonth] = useState(months[0]);
  const filtered = days.filter((d) => d.status === filter);
  const counts = statuses.map((s) => days.filter((d) => d.status === s).length);
  const reasons = new Map<string, number>();
  for (const d of days)
    for (const r of d.rows)
      if (r.level === "must" && (r.value === null || r.value === 0))
        reasons.set(r.label, (reasons.get(r.label) ?? 0) + 1);
  const datesMap = new Map(days.map((d) => [d.date, d]));
  const showDay = (d: Candidate) => {
    setFilter(d.status);
    setOpen(d.date);
    setAll(true);
  };
  const summary = report;
  const best = summary.recommendedDate
    ? datesMap.get(summary.recommendedDate)
    : undefined;
  const conflict = counts[0] === 0 ? describeConflict(days) : "";
  return (
    <div class="results" id="results">
      <div class="result-heading">
        <div>
          <h1>候选婚期</h1>
          <p>
            {ordered[0]} 至 {ordered.at(-1)} · 共核对 {days.length} 天
          </p>
        </div>
        <button class="secondary" onClick={() => modify()}>
          修改条件
        </button>
      </div>
      <section class="panel best-date" aria-label="整体推荐结果">
        <div>
          <h2>{best ? "最推荐的婚期" : "暂无首选日期"}</h2>
          {best ? (
            <>
              <h3>
                {best.date}{" "}
                <small>
                  周{"日一二三四五六"[best.week]} · 农历{best.lunar}
                </small>
              </h3>
              <p>
                {coverage(best)}。
                {summary.tiedDates.length > 1
                  ? "共有 " +
                    summary.tiedDates.length +
                    " 天并列最高分，优先展示较早的一天。"
                  : "在通过全部必须条件的日期中，整体匹配分最高。"}
              </p>
              <button
                class="text-button"
                onClick={() => {
                  showDay(best);
                  requestAnimationFrame(() =>
                    document
                      .getElementById("day-" + best.date)
                      ?.scrollIntoView({ block: "start" }),
                  );
                }}
              >
                查看首选依据
              </button>
            </>
          ) : (
            <p>
              {counts[0]
                ? "启用可核对的规则或补充偏好资料后，可比较得分。"
                : "补齐资料或调整必须条件后重新计算。"}
            </p>
          )}
        </div>
        {best && (
          <div class="overall-score">
            <strong>{best.score}</strong>
            <span>/ 100 分</span>
          </div>
        )}
      </section>
      <section class="panel">
        <h2>筛选结果</h2>
        <div
          class="bar"
          role="img"
          aria-label={statuses.map((s, i) => s + counts[i] + "天").join("，")}
        >
          {counts.map(
            (n, i) =>
              n > 0 && <i class={color(statuses[i])} style={{ flex: n }} />,
          )}
        </div>
        <div class="filters">
          {statuses.map((s, i) => (
            <button
              aria-pressed={s === filter}
              onClick={() => {
                setFilter(s);
                setAll(false);
                setOpen("");
              }}
            >
              <i class={color(s)} />
              {s} <b>{counts[i]}</b>
            </button>
          ))}
        </div>
        {!counts[0] && (
          <div class="notice">
            当前没有通过全部必须条件的日期。
            {conflict ||
              Array.from(reasons)
                .sort((a, b) => b[1] - a[1])
                .map(([label, n]) => label + "涉及 " + n + " 天")
                .join("；")}{" "}
            <button onClick={() => modify(true)}>调整或补充</button>
          </div>
        )}
      </section>
      <section class="panel">
        <div class="title-row">
          <h2>{filter}日期</h2>
          <button onClick={() => setShowCal(!showCal)}>
            <Icon name="calendar" size={15} />
            {showCal ? "收起月历" : "按月查看"}
          </button>
        </div>
        {showCal && (
          <div class="results-calendar">
            <select
              aria-label="月历月份"
              value={month}
              onChange={(e) => setMonth(e.currentTarget.value)}
            >
              {months.map((m) => (
                <option>{m}</option>
              ))}
            </select>
            <MonthGrid month={month} days={datesMap} pick={showDay} />
          </div>
        )}
        {filtered.length === 0 && <p>当前没有此类日期。</p>}
        {(all ? filtered : filtered.slice(0, 3)).map((day) => (
          <article class="day" id={"day-" + day.date}>
            <div class="day-header">
              <div>
                <h3>
                  {day.date} <small>周{"日一二三四五六"[day.week]}</small>
                </h3>
                <small>
                  农历{day.lunar} · {day.status}
                </small>
                <strong class="score-text">
                  {scoreLabel(day)}
                  {best?.date === day.date ? " · 首选" : ""}
                </strong>
                <small>{coverage(day)}</small>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(day.date)}
                  disabled={
                    selected.length >= 2 && !selected.includes(day.date)
                  }
                  onChange={(e) =>
                    setSelected(
                      e.currentTarget.checked
                        ? [...selected, day.date]
                        : selected.filter((d) => d !== day.date),
                    )
                  }
                />
                对比
              </label>
            </div>
            <button
              class="text-button"
              aria-expanded={open === day.date}
              onClick={() => setOpen(open === day.date ? "" : day.date)}
            >
              {open === day.date ? "收起" : "查看"}规则依据{" "}
              <Icon name="chevron" size={14} />
            </button>
            {open === day.date && (
              <Checklist day={day} modify={() => modify(true, day.date)} />
            )}
          </article>
        ))}
        {!all && filtered.length > 3 && (
          <button class="secondary" onClick={() => setAll(true)}>
            查看全部 {filtered.length} 天
          </button>
        )}
      </section>
      {selected.length === 1 && (
        <p role="status">
          已选 {selected[0]}，再选一天即可比较。{" "}
          <button onClick={() => setSelected([])}>清除</button>
        </p>
      )}
      {selected.length === 2 && (
        <Compare
          key={selected.join(",")}
          a={datesMap.get(selected[0])!}
          b={datesMap.get(selected[1])!}
          close={() => setSelected([])}
        />
      )}
    </div>
  );
}
