"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { exportExpenses } from "@/lib/export";

export default function ExportExpensesButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    const { data, error } = await supabase
      .from("expenses")
      .select("id, expense_date, category, amount, supplier, comment, batch_id, batches(batch_name)")
      .order("expense_date", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const rows = data.map((e) => ({
      ...e,
      batch_name: Array.isArray(e.batches)
        ? e.batches[0]?.batch_name
        : (e.batches as { batch_name: string } | null)?.batch_name ?? null,
    }));

    exportExpenses(rows);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:opacity-60"
    >
      {loading ? "Экспорт..." : "↓ Excel"}
    </button>
  );
}
