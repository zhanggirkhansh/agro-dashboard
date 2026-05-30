export const LIVESTOCK_STATUS = {
  ACTIVE: "Активный",
  GAINING: "Набор массы",
  READY_FOR_SALE: "Готовится к продаже",
  SOLD: "Продан",
} as const;

export const BATCH_STATUS = {
  ACTIVE: "Активный",
  GAINING: "Набор массы",
  READY_FOR_SALE: "Готовится к продаже",
} as const;

export type LivestockStatus = (typeof LIVESTOCK_STATUS)[keyof typeof LIVESTOCK_STATUS];
export type BatchStatus = (typeof BATCH_STATUS)[keyof typeof BATCH_STATUS];

// Массивы для select-форм
export const LIVESTOCK_STATUSES = Object.values(LIVESTOCK_STATUS);
export const BATCH_STATUSES = Object.values(BATCH_STATUS);
