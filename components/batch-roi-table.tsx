"use client";

import { useState } from "react";

type BatchRow = {
  id: number;
  name: string | null;
  revenue: number;
  expenses: number;
  profit: number;
  animals: number;
  totalGain: number;
  avgGain: number;
};

type SortKey = "name" | "revenue" | "expenses" | "profit" | "roi" | "animals" | "avgGain";

function roi(row: BatchRow): number | null {
  if (row.expenses <= 0) return null;
  return (row.profit / row.expenses) * 100;
}

function roiColor(value: number | null): string {
  if (value === null) return "text-[#6b7280]";
  if (value >= 20) return "text-green-700 font-semibold";
  if (value >= 0) return "text-amber-700";
  return "text-red-600";
}

export default function BatchROITable({ data }: { data: BatchRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("profit");
  const [asc, setAsc] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setAsc(false);
    }
  }

  const sorted = [...data].sort((a, b) => {
    let av: number | string | null;
    let bv: number | string | null;

    if (sortKey === "roi") {
      av = roi(a);
      bv = roi(b);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
    } else if (sortKey === "name") {
      av = a.name ?? "";
      bv = b.name ?? "";
      return asc
        ? String(av).localeCompare(String(bv), "ru")
        : String(bv).localeCompare(String(av), "ru");
    } else {
      av = a[sortKey] as number;
      bv = b[sortKey] as number;
    }

    return asc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: "name", label: "Партия" },
    { key: "animals", label: "Гол.", align: "right" },
    { key: "revenue", label: "Доход, ₸", align: "right" },
    { key: "expenses", label: "Расходы, ₸", align: "right" },
    { key: "profit", label: "Прибыль, ₸", align: "right" },
    { key: "avgGain", label: "Ср. привес, кг", align: "right" },
    { key: "roi", label: "ROI, %", align: "right" },
  ];

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="ml-1 text-[#c0cbb9]">⇅</span>;
    return <span className="ml-1">{asc ? "↑" : "↓"}</span>;
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
        Пока нет данных для сравнения.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ebf0e6]">
            {cols.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`cursor-pointer select-none whitespace-nowrap px-3 py-3 font-medium text-[#6b7280] hover:text-[#1f4d3a] ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.label}
                <SortIcon col={col.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const r = roi(row);
            return (
              <tr
                key={row.id}
                className={`border-b border-[#f0f4ec] transition-colors hover:bg-[#f8faf7] ${i % 2 === 0 ? "" : "bg-[#fcfdfb]"}`}
              >
                <td className="px-3 py-3 font-medium">{row.name ?? "—"}</td>
                <td className="px-3 py-3 text-right">{row.animals}</td>
                <td className="px-3 py-3 text-right">
                  {row.revenue > 0 ? row.revenue.toLocaleString("ru-RU") : "—"}
                </td>
                <td className="px-3 py-3 text-right">
                  {row.expenses > 0 ? row.expenses.toLocaleString("ru-RU") : "—"}
                </td>
                <td
                  className={`px-3 py-3 text-right ${row.profit >= 0 ? "text-[#2f6a4f]" : "text-[#b91c1c]"} font-medium`}
                >
                  {row.profit >= 0 ? "+" : ""}
                  {row.profit.toLocaleString("ru-RU")}
                </td>
                <td className="px-3 py-3 text-right">
                  {row.avgGain > 0 ? `+${row.avgGain}` : "—"}
                </td>
                <td className={`px-3 py-3 text-right ${roiColor(r)}`}>
                  {r !== null ? `${r >= 0 ? "+" : ""}${r.toFixed(1)}%` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
