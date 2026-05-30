"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { exportAnalyticsSummary } from "@/lib/export";

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
};

export default function ExportAnalyticsButton({ analytics }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    const [{ data: livestock }, { data: expensesData }] = await Promise.all([
      supabase
        .from("livestock")
        .select("id, animal_code, batch, age, status, start_weight, current_weight")
        .order("batch", { ascending: true }),
      supabase
        .from("expenses")
        .select("id, expense_date, category, amount, supplier, comment, batches(batch_name)")
        .order("expense_date", { ascending: false }),
    ]);

    const expenses = (expensesData ?? []).map((e) => ({
      ...e,
      batch_name: Array.isArray(e.batches)
        ? e.batches[0]?.batch_name
        : (e.batches as { batch_name: string } | null)?.batch_name ?? null,
    }));

    exportAnalyticsSummary(analytics, livestock ?? [], expenses);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:opacity-60"
    >
      {loading ? "Подготовка..." : "↓ Сводный Excel"}
    </button>
  );
}
