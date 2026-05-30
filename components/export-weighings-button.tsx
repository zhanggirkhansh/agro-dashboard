"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { exportWeighings } from "@/lib/export";

export default function ExportWeighingsButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    const { data, error } = await supabase
      .from("weighings")
      .select("id, weighing_date, weight, comment, livestock(animal_code, batch)")
      .order("weighing_date", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const rows = data.map((w) => ({
      id: w.id,
      weighing_date: w.weighing_date,
      weight: w.weight,
      comment: w.comment,
      animal_code: Array.isArray(w.livestock)
        ? w.livestock[0]?.animal_code
        : (w.livestock as { animal_code: string; batch: string | null } | null)?.animal_code ?? null,
      batch: Array.isArray(w.livestock)
        ? w.livestock[0]?.batch
        : (w.livestock as { animal_code: string; batch: string | null } | null)?.batch ?? null,
    }));

    exportWeighings(rows);
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
