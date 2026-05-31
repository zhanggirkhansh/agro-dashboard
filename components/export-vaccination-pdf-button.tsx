"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { exportVaccinationPDF } from "@/lib/pdf";

export default function ExportVaccinationPDFButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    const { data } = await supabase
      .from("vaccines")
      .select("*, livestock(animal_code), batches(batch_name)")
      .order("vaccination_date", { ascending: false });

    const records = (data ?? []).map((v) => ({
      vaccine_name: v.vaccine_name,
      vaccination_date: v.vaccination_date,
      next_vaccination_date: v.next_vaccination_date,
      dose: v.dose,
      veterinarian: v.veterinarian,
      vaccine_lot: v.vaccine_lot,
      comment: v.comment,
      animal_code: Array.isArray(v.livestock)
        ? v.livestock[0]?.animal_code
        : (v.livestock as { animal_code: string } | null)?.animal_code,
      batch_name: Array.isArray(v.batches)
        ? v.batches[0]?.batch_name
        : (v.batches as { batch_name: string } | null)?.batch_name,
    }));

    await exportVaccinationPDF(records);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:opacity-60"
    >
      {loading ? "Генерация..." : "↓ PDF акт"}
    </button>
  );
}
