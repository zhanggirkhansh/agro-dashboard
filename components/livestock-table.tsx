"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import DeleteButton from "@/components/delete-button";
import { supabase } from "@/lib/supabase";
import { LIVESTOCK_STATUS, LIVESTOCK_STATUSES } from "@/constants/status";

type Animal = {
  id: number;
  animal_code: string | null;
  batch: string | null;
  age: string | null;
  start_weight: number | null;
  current_weight: number | null;
  status: string | null;
};

type Props = {
  animals: Animal[];
};

export default function LivestockTable({ animals }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>(LIVESTOCK_STATUSES[0]);
  const [applying, setApplying] = useState(false);

  const allSelected = animals.length > 0 && selected.size === animals.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(animals.map((a) => a.id)));
    }
  }

  async function applyBulkStatus() {
    if (selected.size === 0) return;
    setApplying(true);
    await supabase
      .from("livestock")
      .update({ status: bulkStatus })
      .in("id", [...selected]);
    setSelected(new Set());
    setApplying(false);
    router.refresh();
  }

  if (animals.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ebf0e6] bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
        Ничего не найдено.
      </div>
    );
  }

  return (
    <>
      {/* MOBILE CARDS */}
      <div className="space-y-4 md:hidden">
        {animals.map((animal) => {
          const gain =
            animal.start_weight != null && animal.current_weight != null
              ? Number(animal.current_weight) - Number(animal.start_weight)
              : null;
          const isChecked = selected.has(animal.id);

          return (
            <div
              key={animal.id}
              className={`rounded-2xl border p-4 transition ${isChecked ? "border-[#1f4d3a] bg-[#f0fdf4]" : "border-[#ebf0e6] bg-white"}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOne(animal.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 cursor-pointer rounded accent-[#1f4d3a]"
                />
                <button
                  type="button"
                  onClick={() => router.push(`/livestock/${animal.id}`)}
                  className="flex-1 text-left"
                >
                  <p className="font-semibold text-[#1f4d3a]">
                    {animal.animal_code || `ID-${animal.id}`}
                  </p>
                  <p className="mt-0.5 text-sm text-[#6b7280]">
                    Партия: {animal.batch || "Не указана"}
                  </p>
                </button>
                <StatusBadge status={animal.status || LIVESTOCK_STATUS.SOLD} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#f8faf7] p-3">
                  <p className="text-[#6b7280]">Возраст</p>
                  <p className="mt-1 font-medium">{animal.age || "—"}</p>
                </div>
                <div className="rounded-xl bg-[#f8faf7] p-3">
                  <p className="text-[#6b7280]">Привес</p>
                  <p className="mt-1 font-medium text-[#2f6a4f]">
                    {gain != null ? `+${gain} кг` : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8faf7] p-3">
                  <p className="text-[#6b7280]">Стартовый вес</p>
                  <p className="mt-1 font-medium">
                    {animal.start_weight != null ? `${animal.start_weight} кг` : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8faf7] p-3">
                  <p className="text-[#6b7280]">Текущий вес</p>
                  <p className="mt-1 font-medium">
                    {animal.current_weight != null ? `${animal.current_weight} кг` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/livestock/${animal.id}/edit`}
                  className="flex-1 rounded-xl bg-white px-4 py-2 text-center text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                >
                  Изменить
                </Link>
                <DeleteButton
                  table="livestock"
                  id={animal.id}
                  confirmMessage={`Удалить животное «${animal.animal_code || animal.id}»? Действие нельзя отменить.`}
                  redirectTo="/livestock"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[#ebf0e6] md:block">
        <table className="min-w-full text-left">
          <thead className="bg-[#f8faf7] text-sm text-[#6b7280]">
            <tr>
              <th className="w-px px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded accent-[#1f4d3a]"
                />
              </th>
              <th className="px-4 py-3">Код</th>
              <th className="px-4 py-3">Партия</th>
              <th className="px-4 py-3">Возраст</th>
              <th className="px-4 py-3">Стартовый вес</th>
              <th className="px-4 py-3">Текущий вес</th>
              <th className="px-4 py-3">Привес</th>
              <th className="px-4 py-3">Статус</th>
              <th className="w-px px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {animals.map((animal) => {
              const gain =
                animal.start_weight != null && animal.current_weight != null
                  ? Number(animal.current_weight) - Number(animal.start_weight)
                  : null;
              const isChecked = selected.has(animal.id);

              return (
                <tr
                  key={animal.id}
                  onClick={() => router.push(`/livestock/${animal.id}`)}
                  className={`cursor-pointer border-t border-[#ebf0e6] transition hover:bg-[#fbfcfa] ${isChecked ? "bg-[#f0fdf4]" : "bg-white"}`}
                >
                  <td
                    className="w-px px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(animal.id)}
                      className="h-4 w-4 cursor-pointer rounded accent-[#1f4d3a]"
                    />
                  </td>
                  <td className="px-4 py-4 font-medium text-[#1f4d3a]">
                    {animal.animal_code || `ID-${animal.id}`}
                  </td>
                  <td className="px-4 py-4">{animal.batch || "Не указана"}</td>
                  <td className="px-4 py-4">{animal.age || "—"}</td>
                  <td className="px-4 py-4">
                    {animal.start_weight != null ? `${animal.start_weight} кг` : "—"}
                  </td>
                  <td className="px-4 py-4">
                    {animal.current_weight != null ? `${animal.current_weight} кг` : "—"}
                  </td>
                  <td className="px-4 py-4 font-medium text-[#2f6a4f]">
                    {gain != null ? `+${gain} кг` : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={animal.status || LIVESTOCK_STATUS.SOLD} />
                  </td>
                  <td
                    className="w-px whitespace-nowrap px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-2">
                      <Link
                        href={`/livestock/${animal.id}/edit`}
                        className="rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                      >
                        Изменить
                      </Link>
                      <DeleteButton
                        table="livestock"
                        id={animal.id}
                        confirmMessage={`Удалить животное «${animal.animal_code || animal.id}»? Действие нельзя отменить.`}
                        redirectTo="/livestock"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BULK ACTION BAR */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-10 mt-4 flex flex-col gap-3 rounded-2xl border border-[#1f4d3a] bg-white px-4 py-3 shadow-lg ring-1 ring-[#1f4d3a]/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#1f4d3a]">
            Выбрано: {selected.size} {selected.size === 1 ? "животное" : selected.size < 5 ? "животных" : "животных"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#6b7280]">Сменить статус на</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded-xl border border-[#d9e2d2] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f4d3a]"
            >
              {LIVESTOCK_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={applyBulkStatus}
              disabled={applying}
              className="rounded-xl bg-[#1f4d3a] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {applying ? "Применяется..." : "Применить"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#6b7280] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
}
