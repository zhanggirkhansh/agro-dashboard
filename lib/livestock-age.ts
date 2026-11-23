const DAY_MS = 86_400_000;
const farmCalendar = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Almaty" });
const russianPlurals = new Intl.PluralRules("ru-RU");
const agePart = /(\d+)\s*(год(?:а|ов)?|лет|г|месяц(?:а|ев)?|мес|м|недел(?:я|и|ь)|нед|д(?:ень|ня|ней)?)(?:\.)?/gi;

export function farmDate(date = new Date()): string {
  return farmCalendar.format(date);
}

export function parseLivestockAge(value: string): { months: number; days: number } | null {
  const age = value.trim().toLowerCase();
  if (/^\d+$/.test(age)) {
    const months = Number(age);
    return Number.isSafeInteger(months) ? { months, days: 0 } : null;
  }

  let months = 0;
  let days = 0;
  const remainder = age.replace(agePart, (_, amount: string, unit: string) => {
    const count = Number(amount);
    if (unit.startsWith("г") || unit === "лет") months += count * 12;
    else if (unit.startsWith("м")) months += count;
    else days += count * (unit.startsWith("н") ? 7 : 1);
    return "";
  });

  if (!age || age === remainder || /[^\s,]/.test(remainder)) return null;
  if (!Number.isSafeInteger(months) || !Number.isSafeInteger(days)) return null;
  return { months, days };
}

function calendarDate(value: string): Date {
  return new Date(value + "T00:00:00Z");
}

function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}

function inflect(count: number, one: string, few: string, many: string): string {
  const plural = russianPlurals.select(count);
  return plural === "one" ? one : plural === "few" ? few : many;
}

export function formatLivestockAge(
  storedAge: string | null,
  registeredAt: string | null,
  date = farmDate()
): string {
  const original = storedAge?.trim();
  if (!original) return "—";
  const age = parseLivestockAge(original);
  if (!age || !registeredAt) return original;

  const timestamp = new Date(registeredAt);
  if (!Number.isFinite(timestamp.getTime())) return original;
  const registrationDate = /^\d{4}-\d{2}-\d{2}$/.test(registeredAt)
    ? registeredAt
    : farmDate(timestamp);
  const today = calendarDate(date < registrationDate ? registrationDate : date);
  // The last full month of age was reached this many days before registration.
  const anchor = new Date(calendarDate(registrationDate).getTime() - age.days * DAY_MS);
  if (!Number.isFinite(anchor.getTime())) return original;

  let elapsedMonths = (today.getUTCFullYear() - anchor.getUTCFullYear()) * 12
    + today.getUTCMonth() - anchor.getUTCMonth();
  if (addMonths(anchor, elapsedMonths) > today) elapsedMonths -= 1;
  const days = (today.getTime() - addMonths(anchor, elapsedMonths).getTime()) / DAY_MS;
  const months = age.months + elapsedMonths;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const parts: string[] = [];
  if (years) parts.push(`${years} ${inflect(years, "год", "года", "лет")}`);
  if (remainingMonths) parts.push(`${remainingMonths} мес.`);
  if (days || parts.length === 0) parts.push(`${days} ${inflect(days, "день", "дня", "дней")}`);
  return parts.join(" ");
}
