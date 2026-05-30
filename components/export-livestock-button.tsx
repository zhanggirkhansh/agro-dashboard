"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { exportLivestock } from "@/lib/export";

export default function ExportLivestockButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    const { data, error } = await supabase
      .from("livestock")
      .select("id, animal_code, batch, age, status, start_weight, current_weight")
      .order("batch", { ascending: true });

    if (error || !data) {
      setLoading(false);
      return;
    }

    exportLivestock(data);
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
