import * as XLSX from "xlsx";

function download(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

function sheet(rows: Record<string, unknown>[]): XLSX.WorkSheet {
  return XLSX.utils.json_to_sheet(rows);
}

// ── Поголовье ────────────────────────────────────────────────────────────────

type LivestockRow = {
  id: number;
  animal_code: string | null;
  batch: string | null;
  age: string | null;
  status: string | null;
  start_weight: number | null;
  current_weight: number | null;
};

export function exportLivestock(animals: LivestockRow[]) {
  const rows = animals.map((a) => ({
    "Код животного": a.animal_code ?? "—",
    "Партия": a.batch ?? "—",
    "Возраст": a.age ?? "—",
    "Статус": a.status ?? "—",
    "Стартовый вес (кг)": a.start_weight ?? "",
    "Текущий вес (кг)": a.current_weight ?? "",
    "Привес (кг)":
      a.start_weight != null && a.current_weight != null
        ? a.current_weight - a.start_weight
        : "",
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(rows), "Поголовье");
  download(wb, `поголовье_${today()}.xlsx`);
}

// ── Расходы ──────────────────────────────────────────────────────────────────

type ExpenseRow = {
  id: number;
  expense_date: string;
  category: string;
  amount: number;
  supplier: string | null;
  comment: string | null;
  batch_name?: string | null;
};

export function exportExpenses(expenses: ExpenseRow[]) {
  const rows = expenses.map((e) => ({
    "Дата": e.expense_date,
    "Категория": e.category,
    "Сумма (₸)": e.amount,
    "Поставщик": e.supplier ?? "—",
    "Партия": e.batch_name ?? "—",
    "Комментарий": e.comment ?? "",
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(rows), "Расходы");
  download(wb, `расходы_${today()}.xlsx`);
}

// ── Взвешивания ───────────────────────────────────────────────────────────────

type WeighingRow = {
  id: number;
  weighing_date: string;
  weight: number;
  comment: string | null;
  animal_code?: string | null;
  batch?: string | null;
};

export function exportWeighings(weighings: WeighingRow[]) {
  const rows = weighings.map((w) => ({
    "Дата": w.weighing_date,
    "Животное": w.animal_code ?? "—",
    "Партия": w.batch ?? "—",
    "Вес (кг)": w.weight,
    "Комментарий": w.comment ?? "",
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(rows), "Взвешивания");
  download(wb, `взвешивания_${today()}.xlsx`);
}

// ── Сводный экспорт (аналитика) ───────────────────────────────────────────────

type AnalyticsRow = {
  id: number;
  name: string;
  animals: number;
  revenue: number;
  expenses: number;
  profit: number;
  totalGain: number;
  avgGain: number;
};

export function exportAnalyticsSummary(
  analytics: AnalyticsRow[],
  livestock: LivestockRow[],
  expenses: ExpenseRow[]
) {
  const wb = XLSX.utils.book_new();

  // Лист 1 — Финансовая сводка по партиям
  const summaryRows = analytics.map((a) => ({
    "Партия": a.name,
    "Животных": a.animals,
    "Выручка (₸)": a.revenue,
    "Расходы (₸)": a.expenses,
    "Прибыль (₸)": a.profit,
    "Суммарный привес (кг)": a.totalGain,
    "Средний привес (кг)": a.avgGain,
  }));
  XLSX.utils.book_append_sheet(wb, sheet(summaryRows), "Сводка по партиям");

  // Лист 2 — Поголовье
  const livestockRows = livestock.map((a) => ({
    "Код животного": a.animal_code ?? "—",
    "Партия": a.batch ?? "—",
    "Возраст": a.age ?? "—",
    "Статус": a.status ?? "—",
    "Стартовый вес (кг)": a.start_weight ?? "",
    "Текущий вес (кг)": a.current_weight ?? "",
    "Привес (кг)":
      a.start_weight != null && a.current_weight != null
        ? a.current_weight - a.start_weight
        : "",
  }));
  XLSX.utils.book_append_sheet(wb, sheet(livestockRows), "Поголовье");

  // Лист 3 — Расходы
  const expenseRows = expenses.map((e) => ({
    "Дата": e.expense_date,
    "Категория": e.category,
    "Сумма (₸)": e.amount,
    "Поставщик": e.supplier ?? "—",
    "Партия": e.batch_name ?? "—",
    "Комментарий": e.comment ?? "",
  }));
  XLSX.utils.book_append_sheet(wb, sheet(expenseRows), "Расходы");

  download(wb, `аналитика_${today()}.xlsx`);
}

// ── Утилита ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}
