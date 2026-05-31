"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import { LIVESTOCK_STATUS } from "@/constants/status";

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

          return (
            <div
              key={animal.id}
              className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
            >
              <button
                type="button"
                onClick={() => router.push(`/livestock/${animal.id}`)}
                className="w-full text-left"
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
                  <StatusBadge status={animal.status || LIVESTOCK_STATUS.SOLD} />
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

              <Link
                href={`/livestock/${animal.id}/edit`}
                className="mt-3 flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
              >
                Изменить
              </Link>
            </div>
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
              <th className="w-px px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {animals.map((animal) => {
              const gain =
                animal.start_weight != null && animal.current_weight != null
                  ? Number(animal.current_weight) - Number(animal.start_weight)
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
                  <td className="px-4 py-4">{animal.batch || "Не указана"}</td>
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
                    <StatusBadge status={animal.status || LIVESTOCK_STATUS.SOLD} />
                  </td>
                  <td
                    className="w-px whitespace-nowrap px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/livestock/${animal.id}/edit`}
                      className="rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                    >
                      Изменить
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
