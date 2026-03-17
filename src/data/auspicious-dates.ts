import { HolidayUtil, Solar } from "lunar-typescript";

export interface CalendarDay {
  date: string;
  day: number;
  weekdayIndex: number;
  weekdayLabel: string;
  lunarLabel: string;
  yi: string[];
  ji: string[];
  holiday: string | null;
  isHoliday: boolean;
  isWeekend: boolean;
  isAuspicious: boolean;
  isPopular: boolean;
  note: string;
}

export interface CalendarMonth {
  key: string;
  year: number;
  month: number;
  label: string;
  leadingOffset: number;
  days: CalendarDay[];
  auspiciousCount: number;
}

export interface CalendarData {
  generatedAt: string;
  generatedAtLabel: string;
  months: CalendarMonth[];
  recommendations: CalendarDay[];
}

const WEEKDAY_CHARS = ["日", "一", "二", "三", "四", "五", "六"];
const SPECIAL_POPULAR_DATES = new Set(["05-20", "05-21", "10-01"]);

function cloneAtNoon(input: Date) {
  const date = new Date(input);
  date.setHours(12, 0, 0, 0);
  return date;
}

function formatIsoDate(input: Date) {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, "0");
  const day = String(input.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatGeneratedAt(input: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(input);
}

function createNote(date: string, isWeekend: boolean, holiday: string | null) {
  const monthDay = date.slice(5);
  if (holiday) {
    return `${holiday}假期内，异地宾客更容易协调出行。`;
  }
  if (SPECIAL_POPULAR_DATES.has(monthDay)) {
    return "纪念日认知强，属于天然热门档期，建议提前锁档。";
  }
  if (isWeekend) {
    return "周末排期更友好，仪式与宴会安排更从容。";
  }
  return "工作日档期更灵活，预算和团队档期通常更好协调。";
}

function createCalendarDay(input: Date): CalendarDay {
  const date = cloneAtNoon(input);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const holiday = HolidayUtil.getHoliday(year, month, day)?.getName() ?? null;
  const weekdayIndex = date.getDay();
  const isoDate = formatIsoDate(date);
  const yi = lunar.getDayYi();
  const ji = lunar.getDayJi();
  const isWeekend = weekdayIndex === 0 || weekdayIndex === 6;
  const isAuspicious = yi.includes("嫁娶");
  const monthDay = isoDate.slice(5);
  const isPopular = isWeekend || Boolean(holiday) || SPECIAL_POPULAR_DATES.has(monthDay);

  return {
    date: isoDate,
    day,
    weekdayIndex,
    weekdayLabel: `周${WEEKDAY_CHARS[weekdayIndex]}`,
    lunarLabel: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    yi,
    ji,
    holiday,
    isHoliday: Boolean(holiday),
    isWeekend,
    isAuspicious,
    isPopular,
    note: createNote(isoDate, isWeekend, holiday),
  };
}

function createMonth(input: Date): CalendarMonth {
  const firstDay = new Date(input.getFullYear(), input.getMonth(), 1, 12);
  const year = firstDay.getFullYear();
  const month = firstDay.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let index = 1; index <= daysInMonth; index += 1) {
    days.push(createCalendarDay(new Date(year, month - 1, index, 12)));
  }

  return {
    key: `${year}-${String(month).padStart(2, "0")}`,
    year,
    month,
    label: new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
    }).format(firstDay),
    leadingOffset: firstDay.getDay(),
    days,
    auspiciousCount: days.filter((entry) => entry.isAuspicious).length,
  };
}

function sortRecommendations(left: CalendarDay, right: CalendarDay) {
  const score = (item: CalendarDay) => {
    let total = 0;
    if (item.isAuspicious) total += 10;
    if (item.isWeekend) total += 4;
    if (item.isHoliday) total += 3;
    if (SPECIAL_POPULAR_DATES.has(item.date.slice(5))) total += 2;
    return total;
  };

  return score(right) - score(left) || left.date.localeCompare(right.date);
}

export function createCalendarData(referenceDate = new Date()): CalendarData {
  const seed = cloneAtNoon(referenceDate);
  const currentMonth = new Date(seed.getFullYear(), seed.getMonth(), 1, 12);
  const months = [createMonth(currentMonth)];
  const recommendations = months
    .flatMap((month) => month.days)
    .filter((day) => day.isAuspicious)
    .sort(sortRecommendations)
    .slice(0, 8);

  return {
    generatedAt: formatIsoDate(seed),
    generatedAtLabel: formatGeneratedAt(seed),
    months,
    recommendations,
  };
}

export const calendarData = createCalendarData();
