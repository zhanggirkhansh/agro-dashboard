"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { exportAllAnimalsCardsPDF } from "@/lib/pdf";

export default function ExportAllAnimalsPDFButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    // Загружаем всё одним пакетом параллельных запросов
    const [
      { data: animals },
      { data: weighings },
      { data: animalVaccines },
    ] = await Promise.all([
      supabase
        .from("livestock")
        .select("id, animal_code, age, status, batch, batch_id, start_weight, current_weight")
        .order("created_at", { ascending: false }),
      supabase
        .from("weighings")
        .select("animal_id, weighing_date, weight, comment")
        .order("weighing_date", { ascending: true }),
      supabase
        .from("vaccines")
        .select("animal_id, batch_id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian")
        .order("vaccination_date", { ascending: false }),
    ]);

    if (!animals || animals.length === 0) {
      setLoading(false);
      return;
    }

    // Группируем взвешивания по animal_id
    const weighingsByAnimal: Record<number, { weighing_date: string; weight: number; comment: string | null }[]> = {};
    for (const w of weighings ?? []) {
      if (!w.animal_id) continue;
      if (!weighingsByAnimal[w.animal_id]) weighingsByAnimal[w.animal_id] = [];
      weighingsByAnimal[w.animal_id].push(w);
    }

    // Группируем вакцины по animal_id, добавляя партийные туда где нужно
    const batchVaccines: Record<number, typeof animalVaccines> = {};
    const individualVaccines: Record<number, typeof animalVaccines> = {};

    for (const v of animalVaccines ?? []) {
      if (v.animal_id != null) {
        if (!individualVaccines[v.animal_id]) individualVaccines[v.animal_id] = [];
        individualVaccines[v.animal_id]!.push(v);
      } else if (v.batch_id != null) {
        if (!batchVaccines[v.batch_id]) batchVaccines[v.batch_id] = [];
        batchVaccines[v.batch_id]!.push(v);
      }
    }

    const vaccinesByAnimal: Record<number, { vaccine_name: string; vaccination_date: string; next_vaccination_date: string | null; dose: string | null; veterinarian: string | null }[]> = {};
    for (const animal of animals) {
      const seenIds = new Set<string>();
      const combined = [
        ...(individualVaccines[animal.id] ?? []),
        ...(animal.batch_id ? (batchVaccines[animal.batch_id] ?? []) : []),
      ].filter((v) => {
        const key = `${v.vaccine_name}_${v.vaccination_date}`;
        if (seenIds.has(key)) return false;
        seenIds.add(key);
        return true;
      });
      vaccinesByAnimal[animal.id] = combined;
    }

    await exportAllAnimalsCardsPDF(animals, weighingsByAnimal, vaccinesByAnimal);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4] disabled:opacity-60"
    >
      {loading ? "Генерация PDF..." : "↓ PDF все карточки"}
    </button>
  );
}
