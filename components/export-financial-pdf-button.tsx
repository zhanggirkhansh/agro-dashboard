"use client";

import { useState } from "react";
import { exportFinancialPDF } from "@/lib/pdf";

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

type Props = {
  analytics: AnalyticsRow[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
};

export default function ExportFinancialPDFButton({
  analytics,
  totalRevenue,
  totalExpenses,
  totalProfit,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    await exportFinancialPDF(analytics, totalRevenue, totalExpenses, totalProfit);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:opacity-60"
    >
      {loading ? "Генерация..." : "↓ PDF отчёт"}
    </button>
  );
}
