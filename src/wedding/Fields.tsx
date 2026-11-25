import { LunarYear, LunarMonth } from "lunar-typescript";
import { useState } from "preact/hooks";
import { birthday, two, groups, ids, rules, levels } from "./calendar";
import type { Birth, Level, Settings, RuleId, Schedule } from "./calendar";
import { askAnalysis, type Proposal } from "./analysis";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    calendar: "M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5",
    book: "M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1v14",
    tune: "M3 7h6m4 0h8M3 17h10m4 0h4 M9 4v6m4 4v6",
    arrow: "M4 12h15m-6-6 6 6-6 6",
    chevron: "m8 10 4 4 4-4",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0 M12 6v6l4 2",
    people:
      "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-2a6 6 0 0 1 12 0v2 M15 5a4 4 0 0 1 0 7m2 3a5 5 0 0 1 5 5",
    check: "m5 12 4 4 10-10",
    leaf: "M3 20c5-9 12-9 17-16 M7 14C4 8 11 5 20 4c1 9-4 15-11 13",
    lock: "M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3",
    spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function BirthField({
  label,
  birth,
  onChange,
  max,
}: {
  label: string;
  birth: Birth;
  onChange: (b: Birth) => void;
  max: string;
}) {
  const [y, m, d] = birth.value.split("-").map(Number);
  const year = Number(max.slice(0, 4)),
    leap = y ? LunarYear.fromYear(y).getLeapMonth() : 0;
  const count =
    y && m
      ? (LunarMonth.fromYm(y, birth.leap ? -m : m)?.getDayCount() ?? 30)
      : 30;
  function lunarValue(ny: number, nm: number, nd: number, leap = false) {
    onChange({
      ...birth,
      value: [ny || "", nm ? two(nm) : "", nd ? two(nd) : ""].join("-"),
      leap,
    });
  }
  let summary = "";
  try {
    if (birth.value && !birth.value.endsWith("-")) {
      const l = birthday(birth);
      summary = "属" + l.getYearShengXiao() + " · 公历 " + l.getSolar().toYmd();
    }
  } catch {}
  return (
    <fieldset class="birth">
      <legend>{label}生日</legend>
      <div class="birth-controls">
        <select
          aria-label={label + "历法"}
          value={birth.kind}
          onChange={(e) =>
            onChange({
              kind: e.currentTarget.value as Birth["kind"],
              value: "",
              leap: false,
            })
          }
        >
          <option>公历</option>
          <option>农历</option>
        </select>
        {birth.kind === "公历" ? (
          <input
            aria-label={label + "生日"}
            type="date"
            min="1900-01-01"
            max={max}
            required
            value={birth.value}
            onInput={(e) =>
              onChange({ ...birth, value: e.currentTarget.value })
            }
          />
        ) : (
          <div class="lunar-fields">
            <select
              required
              aria-label={label + "农历年"}
              value={y || ""}
              onChange={(e) => lunarValue(+e.currentTarget.value, 0, 0)}
            >
              <option value="">年</option>
              {Array.from({ length: year - 1899 }, (_, i) => (
                <option value={year - i}>{year - i}</option>
              ))}
            </select>
            <select
              required
              aria-label={label + "农历月"}
              value={m ? (birth.leap ? -m : m) : ""}
              onChange={(e) => {
                const v = +e.currentTarget.value;
                lunarValue(y, Math.abs(v), 0, v < 0);
              }}
            >
              <option value="">月</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).flatMap((n) => [
                <option value={n}>{n}月</option>,
                leap === n && <option value={-n}>闰{n}月</option>,
              ])}
            </select>
            <select
              required
              aria-label={label + "农历日"}
              value={d || ""}
              onChange={(e) =>
                lunarValue(y, m, +e.currentTarget.value, birth.leap)
              }
            >
              <option value="">日</option>
              {Array.from({ length: count }, (_, i) => (
                <option value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {summary && <small>{summary}</small>}
    </fieldset>
  );
}
export function LevelSelect({
  value,
  set,
  label,
}: {
  value: Level;
  set: (v: Level) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label + "要求"}
      value={value}
      onChange={(e) => set(e.currentTarget.value as Level)}
    >
      {Object.entries(levels).map(([v, l]) => (
        <option value={v}>{l}</option>
      ))}
    </select>
  );
}
export function SettingsForm({
  s,
  update,
  note,
  setNote,
  range,
}: {
  s: Settings;
  update: (s: Settings) => void;
  note: string;
  setNote: (n: string) => void;
  range: string;
}) {
  const [items, setItems] = useState<Proposal[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const setLevel = (id: RuleId, level: Level) =>
    update({ ...s, levels: { ...s.levels, [id]: level } });
  const schedule = (key: string, v: Partial<Schedule>) =>
    update({
      ...s,
      schedules: s.schedules.map((x) => (x.key === key ? { ...x, ...v } : x)),
    });
  const addSchedule = (name: string, include: boolean) =>
    update({
      ...s,
      schedules: [
        ...s.schedules,
        { key: crypto.randomUUID(), name, include, level: "must", dates: "" },
      ],
    });
  function apply(p: Proposal) {
    if (p.type === "schedule")
      update({
        ...s,
        schedules: [
          ...s.schedules,
          {
            key: crypto.randomUUID(),
            name: p.name,
            include: p.include,
            dates: p.dates,
            level: p.level,
          },
        ],
      });
    else if (p.type !== "question")
      update({
        ...s,
        levels: { ...s.levels, [p.type]: p.level },
        ...(p.type === "week" && p.weekdays.length
          ? { weekdays: p.weekdays }
          : {}),
        ...(p.type === "month" ? { small: p.small } : {}),
      });
    setItems(items.filter((x) => x !== p));
  }
  return (
    <div class="advanced">
      <p>「必须满足」决定日期能否推荐；「尽量满足」用于比较合适的日期。</p>
      {groups.map((group, g) => (
        <details class="rule-group">
          <summary>
            {group}
            <Icon name="chevron" size={16} />
          </summary>
          <div>
            {ids
              .filter((id) => rules[id][1] === g)
              .map((id) => (
                <div class="rule-line">
                  <label>{rules[id][0]}</label>
                  <LevelSelect
                    value={s.levels[id]}
                    set={(v) => setLevel(id, v)}
                    label={rules[id][0]}
                  />
                </div>
              ))}
            {g === 2 && s.levels.month === "must" && (
              <label>
                <input
                  type="checkbox"
                  checked={s.small}
                  onChange={(e) =>
                    update({ ...s, small: e.currentTarget.checked })
                  }
                />
                也接受小利月
              </label>
            )}
            {g === 5 && s.levels.week !== "off" && (
              <div class="week-picks">
                {[1, 2, 3, 4, 5, 6, 0].map((n) => (
                  <label>
                    <input
                      type="checkbox"
                      checked={s.weekdays.includes(n)}
                      onChange={(e) =>
                        update({
                          ...s,
                          weekdays: e.currentTarget.checked
                            ? [...s.weekdays, n]
                            : s.weekdays.filter((x) => x !== n),
                        })
                      }
                    />
                    {"周" + "日一二三四五六"[n]}
                  </label>
                ))}
              </div>
            )}
            {g === 4 && s.levels.parents !== "off" && (
              <div class="family">
                <small>勾选需要核对的家人。不知道生日可暂时留空。</small>
                {s.parents.map((p, i) => {
                  const edit = (v: Partial<typeof p>) =>
                    update({
                      ...s,
                      parents: s.parents.map((a, j) =>
                        j === i ? { ...a, ...v } : a,
                      ),
                    });
                  return (
                    <div class="family-row">
                      <label>
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={(e) =>
                            edit({ enabled: e.currentTarget.checked })
                          }
                        />
                        {p.name}
                      </label>
                      <select
                        aria-label={p.name + "生日历法"}
                        disabled={!p.enabled}
                        value={p.kind}
                        onChange={(e) =>
                          edit({ kind: e.currentTarget.value as typeof p.kind })
                        }
                      >
                        <option>公历</option>
                        <option>农历</option>
                        <option>闰月</option>
                      </select>
                      <input
                        aria-label={p.name + "生日月日"}
                        disabled={!p.enabled}
                        placeholder="MM-DD"
                        maxLength={5}
                        value={p.value}
                        onInput={(e) => edit({ value: e.currentTarget.value })}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            {(g === 4 || g === 5) && (
              <>
                {s.schedules
                  .filter((x) => (x.include ? 5 : 4) === g)
                  .map((x) => (
                    <div class="schedule">
                      <input
                        aria-label="安排名称"
                        value={x.name}
                        maxLength={80}
                        onInput={(e) =>
                          schedule(x.key, { name: e.currentTarget.value })
                        }
                      />
                      <LevelSelect
                        value={x.level}
                        set={(v) => schedule(x.key, { level: v })}
                        label={x.name}
                      />
                      <input
                        aria-label={x.name + "日期"}
                        value={x.dates}
                        placeholder="2027-10-02，或 2027-10-01~2027-10-07"
                        onInput={(e) =>
                          schedule(x.key, { dates: e.currentTarget.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          update({
                            ...s,
                            schedules: s.schedules.filter(
                              (a) => a.key !== x.key,
                            ),
                          })
                        }
                      >
                        移除
                      </button>
                    </div>
                  ))}
                <button
                  type="button"
                  class="text-button"
                  onClick={() =>
                    addSchedule(
                      g === 4 ? "家庭避让日" : "酒店可用档期",
                      g === 5,
                    )
                  }
                >
                  {g === 4 ? "＋ 添加不可用日期" : "＋ 添加场地或亲友可用日期"}
                </button>
              </>
            )}
          </div>
        </details>
      ))}
      <label class="note-label">
        给 AI 的备注
        <textarea
          maxLength={1000}
          value={note}
          disabled={busy}
          onInput={(e) => {
            setNote(e.currentTarget.value);
            setItems([]);
            setMessage("");
          }}
          placeholder="例如：最好周六，酒店只剩 10 月 2 日和 3 日。"
        />
      </label>
      <button
        class="secondary"
        type="button"
        disabled={busy || !note.trim()}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          setItems([]);
          try {
            const r = await askAnalysis<{ items: Proposal[] }>({
              mode: "notes",
              note,
              range,
            });
            setItems(r.items);
            setMessage(
              r.items.length
                ? "请核对后逐条应用，原设置将在应用后更新。"
                : "请补充更具体的要求。",
            );
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Icon name="spark" size={15} />
        {busy ? "正在整理…" : "整理为条件"}
      </button>
      <small>点击后仅发送备注和意向时段至 DeepSeek。</small>
      <p role="status">{message}</p>
      {items.map((p) => (
        <div class="proposal">
          <span>
            {p.name}
            <small>
              {p.type === "question"
                ? "请补充后重新整理"
                : levels[p.level] +
                  (p.dates ? " · " + p.dates : "") +
                  (p.type === "week"
                    ? " · " +
                      p.weekdays
                        .map((x) => "周" + "日一二三四五六"[x])
                        .join("、")
                    : "")}
            </small>
          </span>
          {p.type !== "question" && (
            <button type="button" onClick={() => apply(p)}>
              应用
            </button>
          )}
          <button
            type="button"
            onClick={() => setItems(items.filter((x) => x !== p))}
          >
            忽略
          </button>
        </div>
      ))}
    </div>
  );
}
