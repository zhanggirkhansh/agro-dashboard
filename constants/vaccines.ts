export const VACCINE_NAMES = [
  "Ящур",
  "Сибирская язва",
  "Бруцеллёз",
  "Эмкар",
  "Пастереллёз",
  "Лептоспироз",
  "Трихофития",
  "Нодулярный дерматит",
] as const;

export const VACCINE_STATUS = {
  DONE: "Выполнено",
  UPCOMING: "Скоро",
  OVERDUE: "Просрочено",
} as const;

export function getVaccineStatus(nextDate: string | null): string {
  if (!nextDate) return VACCINE_STATUS.DONE;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(nextDate);
  const diffDays = Math.ceil((next.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return VACCINE_STATUS.OVERDUE;
  if (diffDays <= 30) return VACCINE_STATUS.UPCOMING;
  return VACCINE_STATUS.DONE;
}
