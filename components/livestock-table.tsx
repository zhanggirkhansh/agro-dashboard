"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/status-badge";

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

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");

  const uniqueBatches = useMemo(() => {
    return Array.from(
      new Set(animals.map((animal) => animal.batch).filter(Boolean))
    ) as string[];
  }, [animals]);

  const filteredAnimals = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return animals.filter((animal) => {
      const code = (animal.animal_code || "").toLowerCase();
      const id = String(animal.id).toLowerCase();
      const batch = animal.batch || "";
      const status = animal.status || "";

      const matchesQuery =
        !normalized || code.includes(normalized) || id.includes(normalized);

      const matchesStatus = !statusFilter || status === statusFilter;
      const matchesBatch = !batchFilter || batch === batchFilter;

      return matchesQuery && matchesStatus && matchesBatch;
    });
  }, [animals, query, statusFilter, batchFilter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по коду или ID..."
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
        >
          <option value="">Все статусы</option>
          <option value="Активный">Активный</option>
          <option value="Набор массы">Набор массы</option>
          <option value="Готовится к продаже">Готовится к продаже</option>
          <option value="Продан">Продан</option>
        </select>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
        >
          <option value="">Все партии</option>
          {uniqueBatches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#6b7280]">
          Найдено: {filteredAnimals.length}
        </div>

        <button
          type="button"
          onClick={() => {
            setQuery("");
            setStatusFilter("");
            setBatchFilter("");
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
        >
          Сбросить фильтры
        </button>
      </div>

      {filteredAnimals.length === 0 ? (
        <div className="rounded-2xl border border-[#ebf0e6] bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
          Ничего не найдено.
        </div>
      ) : (
        <>
          {/* MOBILE CARDS */}
          <div className="space-y-4 md:hidden">
            {filteredAnimals.map((animal) => {
              const gain =
                animal.start_weight != null && animal.current_weight != null
                  ? Number(animal.current_weight) - Number(animal.start_weight)
                  : null;

              return (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => router.push(`/livestock/${animal.id}`)}
                  className="w-full rounded-2xl border border-[#ebf0e6] bg-white p-4 text-left transition hover:bg-[#fbfcfa]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1f4d3a]">
                        {animal.animal_code || `ID-${animal.id}`}
                      </p>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        Партия: {animal.batch || "Не указана"}
                      </p>
                    </div>

                    <StatusBadge status={animal.status || "Продан"} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
                        {animal.start_weight != null
                          ? `${animal.start_weight} кг`
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f8faf7] p-3">
                      <p className="text-[#6b7280]">Текущий вес</p>
                      <p className="mt-1 font-medium">
                        {animal.current_weight != null
                          ? `${animal.current_weight} кг`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#ebf0e6] md:block">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8faf7] text-sm text-[#6b7280]">
                <tr>
                  <th className="px-4 py-3">Код</th>
                  <th className="px-4 py-3">Партия</th>
                  <th className="px-4 py-3">Возраст</th>
                  <th className="px-4 py-3">Стартовый вес</th>
                  <th className="px-4 py-3">Текущий вес</th>
                  <th className="px-4 py-3">Привес</th>
                  <th className="px-4 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => {
                  const gain =
                    animal.start_weight != null &&
                    animal.current_weight != null
                      ? Number(animal.current_weight) -
                        Number(animal.start_weight)
                      : null;

                  return (
                    <tr
                      key={animal.id}
                      onClick={() => router.push(`/livestock/${animal.id}`)}
                      className="cursor-pointer border-t border-[#ebf0e6] bg-white transition hover:bg-[#fbfcfa]"
                    >
                      <td className="px-4 py-4 font-medium text-[#1f4d3a]">
                        {animal.animal_code || `ID-${animal.id}`}
                      </td>

                      <td className="px-4 py-4">
                        {animal.batch || "Не указана"}
                      </td>

                      <td className="px-4 py-4">{animal.age || "—"}</td>

                      <td className="px-4 py-4">
                        {animal.start_weight != null
                          ? `${animal.start_weight} кг`
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        {animal.current_weight != null
                          ? `${animal.current_weight} кг`
                          : "—"}
                      </td>

                      <td className="px-4 py-4 font-medium text-[#2f6a4f]">
                        {gain != null ? `+${gain} кг` : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={animal.status || "Продан"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}