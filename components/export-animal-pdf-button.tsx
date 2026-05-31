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

    const [{ data: animal }, { data: weighings }, { data: vaccines }] =
      await Promise.all([
        supabase
          .from("livestock")
          .select("animal_code, age, status, batch, start_weight, current_weight")
          .eq("id", animalId)
          .single(),
        supabase
          .from("weighings")
          .select("weighing_date, weight, comment")
          .eq("animal_id", animalId)
          .order("weighing_date", { ascending: true }),
        supabase
          .from("vaccines")
          .select("vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian")
          .eq("animal_id", animalId)
          .order("vaccination_date", { ascending: false }),
      ]);

    if (!animal) { setLoading(false); return; }

    await exportAnimalCardPDF(animal, weighings ?? [], vaccines ?? []);
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
