"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { exportAnimalCardPDF } from "@/lib/pdf";

type Props = {
  animalId: number;
  animalCode: string | null;
};

export default function ExportAnimalPDFButton({ animalId, animalCode }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    const [{ data: animal }, { data: weighings }] = await Promise.all([
      supabase
        .from("livestock")
        .select("animal_code, age, status, batch, batch_id, start_weight, current_weight")
        .eq("id", animalId)
        .single(),
      supabase
        .from("weighings")
        .select("weighing_date, weight, comment")
        .eq("animal_id", animalId)
        .order("weighing_date", { ascending: true }),
    ]);

    if (!animal) { setLoading(false); return; }

    // Вакцины индивидуальные + партийные (как на странице карточки)
    const vaccineQueries = [
      supabase
        .from("vaccines")
        .select("id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian")
        .eq("animal_id", animalId)
        .order("vaccination_date", { ascending: false }),
    ];

    if (animal.batch_id) {
      vaccineQueries.push(
        supabase
          .from("vaccines")
          .select("id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian")
          .eq("batch_id", animal.batch_id)
          .is("animal_id", null)
          .order("vaccination_date", { ascending: false })
      );
    }

    const vaccineResults = await Promise.all(vaccineQueries);
    const seenIds = new Set<number>();
    const allVaccines = vaccineResults
      .flatMap((r) => r.data ?? [])
      .filter((v) => {
        if (seenIds.has(v.id)) return false;
        seenIds.add(v.id);
        return true;
      })
      .sort((a, b) => b.vaccination_date.localeCompare(a.vaccination_date));

    await exportAnimalCardPDF(animal, weighings ?? [], allVaccines);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:opacity-60"
    >
      {loading ? "Генерация..." : "↓ PDF карточка"}
    </button>
  );
}
