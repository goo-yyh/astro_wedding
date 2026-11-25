import { useState, useEffect } from "preact/hooks";
import { Solar } from "lunar-typescript";
import {
  birthday,
  calculate,
  dateRange,
  initialSettings,
  intervals,
  solar,
  two,
  levels,
  ids,
  rules,
  type Birth,
  dateReport,
  type WeddingReport,
} from "./calendar";
import { BirthField, Icon, SettingsForm } from "./Fields";
import { Results } from "./Results";
const blank: Birth = { kind: "公历", value: "", leap: false };
function Almanac({ now }: { now: string }) {
  const [offset, setOffset] = useState(0);
  const day = solar(now).next(offset),
    l = day.getLunar();
  return (
    <section class="almanac" aria-label="黄历速览">
      <div class="almanac-top">
        <span>
          <Icon name="book" size={17} /> 黄历速览
        </span>
        <span>{day.getYear()} 年</span>
      </div>
      <div class="almanac-body">
        <div class="almanac-date">
          <div>
            <span>
              {day.getMonth()} 月 · 星期{"日一二三四五六"[day.getWeek()]}
            </span>
            <strong>{two(day.getDay())}</strong>
          </div>
          <div class="lunar-date">
            {l.getMonthInChinese()}月{l.getDayInChinese()}
          </div>
        </div>
        <p class="day-pillar">
          {l.getYearInGanZhi()}年　{l.getMonthInGanZhi()}月　
          {l.getDayInGanZhi()}日
        </p>
        <div class="yi-ji">
          <b>宜</b>
          <span>{l.getDayYi().slice(0, 4).join("　")}</span>
        </div>
        <div class="yi-ji">
          <b>忌</b>
          <span>{l.getDayJi().slice(0, 4).join("　")}</span>
        </div>
      </div>
      <div class="almanac-nav">
        <button aria-label="前一天" onClick={() => setOffset(offset - 1)}>
          ‹
        </button>
        <button onClick={() => setOffset(0)}>
          {offset === 0 ? "今日" : day.toYmd() + " · 返回今日"}
        </button>
        <button aria-label="后一天" onClick={() => setOffset(offset + 1)}>
          ›
        </button>
      </div>
    </section>
  );
}
function Guide({ close }: { close: () => void }) {
  return (
    <div class="guide panel">
      <h1>择日规则说明</h1>
      <p>
        本工具用于中国境内婚礼筹备。所有日期按北京时间核对，规则的适用范围可在计算前调整。
      </p>
      <h2>结果如何产生</h2>
      <p>
        必须条件不符合的日期归入已排除；尚缺资料的归入待核对。其余日期按已核对的偏好组等权计算百分制匹配分，四舍五入到整数。同分按日期先后显示。只有必须条件、且全部通过时记
        100 分。没有可评分依据时不指定首选。分数体现规则匹配程度。
      </p>
      <h2>历法与月份</h2>
      <p>
        公农历、生肖、宜忌、吉神和节气采用 lunar-typescript
        1.8.6。生肖按农历新年换年。女方月份按下表，闰月按同名月份核对。
      </p>
      <table>
        <thead>
          <tr>
            <th>女方生肖</th>
            <th>大利月</th>
            <th>小利月</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["鸡、兔", "一、七", "六、十二"],
            ["虎、猴", "二、八", "三、九"],
            ["蛇、猪", "三、九", "二、八"],
            ["龙、狗", "四、十", "五、十一"],
            ["牛、羊", "五、十一", "四、十"],
            ["鼠、马", "六、十二", "一、七"],
          ].map((r) => (
            <tr>
              {r.map((x) => (
                <td>{x}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h2>传统择日</h2>
      <p>
        三娘煞按农历初三、初七、十三、十八、廿二、廿七。杨公忌采用常见十三日表，闰月不重复套用。四离按二分二至前一日，四绝按四立前一日。不将日取当日吉神中的“不将”，建除偏好成、开、定、满。
      </p>
      <h2>家庭资料与 AI</h2>
      <p>
        生日和档期在本页计算。点击整理备注时，发送备注和意向时段给
        DeepSeek；比较婚期时仅发送所选日期与规则结论。关闭页面后需重新填写。
      </p>
      <button class="primary" onClick={close}>
        返回婚期计算 <Icon name="arrow" size={16} />
      </button>
    </div>
  );
}
export default function Planner({ now }: { now: string }) {
  const [bride, setBride] = useState<Birth>({ ...blank }),
    [groom, setGroom] = useState<Birth>({ ...blank });
  const initial = solar(now).next(1).toYmd();
  const [start, setStart] = useState(initial),
    [end, setEnd] = useState(solar(initial).next(179).toYmd()),
    [mode, setMode] = useState("未来半年"),
    [list, setList] = useState("");
  const [settings, update] = useState(initialSettings),
    [advanced, setAdvanced] = useState(false),
    [notes, setNotes] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [results, setResults] = useState<WeddingReport | null>(null),
    [remember, setRemember] = useState(""),
    [guide, setGuide] = useState(false);
  useEffect(() => {
    const nav = () => setGuide(location.hash === "#guide");
    nav();
    window.addEventListener("hashchange", nav);
    return () => window.removeEventListener("hashchange", nav);
  }, []);
  function help(on: boolean) {
    location.hash = on ? "guide" : "calculator";
    setGuide(on);
    window.scrollTo(0, 0);
  }
  function changeMode(m: string) {
    setMode(m);
    if (m === "未来半年" || m === "未来一年") {
      setStart(initial);
      setEnd(
        solar(initial)
          .next(m === "未来半年" ? 179 : 364)
          .toYmd(),
      );
    }
    if (m === "选择月份") {
      setStart(initial.slice(0, 7) + "-01");
      setEnd(
        Solar.fromYmd(+initial.slice(0, 4), +initial.slice(5, 7), 1)
          .nextMonth(1)
          .next(-1)
          .toYmd(),
      );
    }
  }
  async function submit(e: Event) {
    e.preventDefault();
    setError("");
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    try {
      for (const [label, b] of [
        ["新娘", bride],
        ["新郎", groom],
      ] as const) {
        try {
          if (birthday(b).getSolar().toYmd() > now)
            throw Error("生日不能晚于今天。");
        } catch (err) {
          throw Error(label + "：" + (err as Error).message);
        }
      }
      let dates: string[];
      if (mode === "指定日期") {
        const w = intervals(list);
        if (w.length > 100) throw Error("指定日期最多填写 100 项。");
        dates = [...new Set(w.flatMap((x) => dateRange(x.start, x.end)))];
        if (!dates.length || dates.length > 731)
          throw Error("请填写 1 至 731 个候选日期。");
      } else dates = dateRange(start, end);
      const data = calculate(dates, bride, groom, settings);
      setResults(dateReport(data));
      window.scrollTo(0, 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const active = ids.filter((id) => settings.levels[id] !== "off");
  const count = (l: string) =>
    active.filter((id) => settings.levels[id] === l).length +
    settings.schedules.filter((x) => x.level === l).length;
  const openSettings = () => {
    setAdvanced(true);
    requestAnimationFrame(() =>
      document
        .getElementById("settings")
        ?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  };
  return (
    <>
      <header class="site-head">
        <div class="wrap header-inner">
          <a class="brand" href="#calculator" onClick={() => help(false)}>
            <span class="seal" aria-hidden="true">
              囍
            </span>
            <span>婚期计算</span>
          </a>
          <nav>
            <a
              aria-current={!guide ? "page" : undefined}
              href="#calculator"
              onClick={() => help(false)}
            >
              婚期测算
            </a>
            <a
              aria-current={guide ? "page" : undefined}
              href="#guide"
              onClick={() => help(true)}
            >
              规则说明
            </a>
          </nav>
        </div>
      </header>
      <main class="wrap">
        {guide ? (
          <Guide close={() => help(false)} />
        ) : results ? (
          <Results
            report={results}
            initialDate={remember}
            modify={(a, d) => {
              setRemember(d || "");
              setResults(null);
              if (a) openSettings();
              else window.scrollTo(0, 0);
            }}
          />
        ) : (
          <>
            <div class="intro">
              <h1>婚期计算</h1>
              <p>结合两人生辰与家庭安排，选出合适的婚礼日期。</p>
            </div>
            <div class="workspace">
              <form class="panel planner" onSubmit={submit}>
                <div class="section-title">
                  <span class="section-icon">
                    <Icon name="people" />
                  </span>
                  <div>
                    <h2>新人资料</h2>
                    <p>按公历或农历填写双方生日。</p>
                  </div>
                </div>
                <div class="birth-grid">
                  <BirthField
                    label="新娘"
                    birth={bride}
                    onChange={setBride}
                    max={now}
                  />
                  <BirthField
                    label="新郎"
                    birth={groom}
                    onChange={setGroom}
                    max={now}
                  />
                </div>
                <section class="form-section">
                  <div class="section-title">
                    <span class="section-icon">
                      <Icon name="calendar" />
                    </span>
                    <div>
                      <h2>意向婚期</h2>
                      <p>选择计划举办婚礼的时间范围。</p>
                    </div>
                  </div>
                  <div class="modes">
                    {[
                      "未来半年",
                      "未来一年",
                      "选择月份",
                      "自定区间",
                      "指定日期",
                    ].map((m) => (
                      <button
                        type="button"
                        aria-pressed={mode === m}
                        onClick={() => changeMode(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {mode === "指定日期" ? (
                    <label>
                      候选日期
                      <input
                        required
                        placeholder="如 2027-05-01，2027-05-08"
                        value={list}
                        onInput={(e) => setList(e.currentTarget.value)}
                      />
                    </label>
                  ) : mode === "选择月份" ? (
                    <label>
                      举办月份
                      <input
                        type="month"
                        required
                        min="1900-01"
                        max="2100-12"
                        value={start.slice(0, 7)}
                        onInput={(e) => {
                          const v = e.currentTarget.value;
                          setStart(v ? v + "-01" : "");
                          setEnd(
                            v
                              ? solar(v + "-01")
                                  .nextMonth(1)
                                  .next(-1)
                                  .toYmd()
                              : "",
                          );
                        }}
                      />
                    </label>
                  ) : (
                    <div class="date-range">
                      <label>
                        开始日期
                        <input
                          type="date"
                          required
                          value={start}
                          onInput={(e) => {
                            setStart(e.currentTarget.value);
                            setMode("自定区间");
                          }}
                        />
                      </label>
                      <span>至</span>
                      <label>
                        结束日期
                        <input
                          type="date"
                          required
                          min={start}
                          value={end}
                          onInput={(e) => {
                            setEnd(e.currentTarget.value);
                            setMode("自定区间");
                          }}
                        />
                      </label>
                    </div>
                  )}
                </section>
                <section class="settings" id="settings">
                  <button
                    class="settings-toggle"
                    type="button"
                    aria-expanded={advanced}
                    onClick={() => setAdvanced(!advanced)}
                  >
                    <Icon name="tune" />
                    <span>
                      <strong>规则与家庭安排</strong>
                      <small>
                        已启用 {count("must")} 项必须条件 · {count("prefer")}{" "}
                        项偏好
                      </small>
                    </span>
                    <span class="toggle-action">
                      {advanced ? "收起" : "调整"}{" "}
                      <Icon name="chevron" size={15} />
                    </span>
                  </button>
                  {advanced && (
                    <SettingsForm
                      key={mode === "指定日期" ? list : start + end}
                      s={settings}
                      update={update}
                      note={notes}
                      setNote={setNotes}
                      range={mode === "指定日期" ? list : start + " 至 " + end}
                    />
                  )}
                </section>
                {error && (
                  <p class="error" role="alert">
                    {error}
                  </p>
                )}
                <button class="primary calc" disabled={busy}>
                  {busy ? "正在核对日期…" : "查看候选婚期"}
                  <Icon name="arrow" size={18} />
                </button>
              </form>
              <aside>
                <Almanac now={now} />
                <section class="side-rules">
                  <div class="title-row">
                    <h2>本次择日依据</h2>
                    <Icon name="tune" size={17} />
                  </div>
                  {(["yi", "clash", "month", "week"] as const).map((id) => (
                    <div>
                      <span>{rules[id][0]}</span>
                      <b
                        class={settings.levels[id] === "must" ? "required" : ""}
                      >
                        {levels[settings.levels[id]]}
                      </b>
                    </div>
                  ))}
                  <button class="text-button" onClick={openSettings}>
                    查看全部规则 <Icon name="arrow" size={14} />
                  </button>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
      <footer class="wrap">
        <span>婚期计算</span>
        <span>结果按所选民俗规则与家庭安排生成，供商定婚期参考。</span>
      </footer>
    </>
  );
}
