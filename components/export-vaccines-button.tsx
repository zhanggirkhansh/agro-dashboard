"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { getVaccineStatus } from "@/constants/vaccines";

export default function ExportVaccinesButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    const { data } = await supabase
      .from("vaccines")
      .select("*, livestock(animal_code), batches(batch_name)")
      .order("vaccination_date", { ascending: false });

    const rows = (data ?? []).map((v) => {
      const animalCode = Array.isArray(v.livestock)
        ? v.livestock[0]?.animal_code
        : (v.livestock as { animal_code: string } | null)?.animal_code;
      const batchName = Array.isArray(v.batches)
        ? v.batches[0]?.batch_name
        : (v.batches as { batch_name: string } | null)?.batch_name;

      return {
        "Животное": animalCode ?? "—",
        "Партия": batchName ?? "—",
        "Вакцина": v.vaccine_name,
        "Дата вакцинации": v.vaccination_date,
        "Следующая вакцинация": v.next_vaccination_date ?? "—",
        "Статус": getVaccineStatus(v.next_vaccination_date),
        "Доза": v.dose ?? "—",
        "Ветеринар": v.veterinarian ?? "—",
        "Серия вакцины": v.vaccine_lot ?? "—",
        "Комментарий": v.comment ?? "",
      };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Вакцинации");
    XLSX.writeFile(wb, `вакцинации_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
