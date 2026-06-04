export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import DeleteButton from "@/components/delete-button";
import { supabase } from "@/lib/supabase";
import { LIVESTOCK_STATUS } from "@/constants/status";
import { getVaccineStatus, VACCINE_STATUS } from "@/constants/vaccines";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BatchDetailsPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  const [
    { data: batch, error: batchError },
    { data: animals, error: animalsError },
    { data: batchVaccines },
  ] = await Promise.all([
    supabase.from("batches").select("*").eq("id", numericId).single(),
    supabase.from("livestock").select("*").eq("batch_id", numericId).order("created_at", { ascending: false }),
    supabase
      .from("vaccines")
      .select("id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian, vaccine_lot")
      .eq("batch_id", numericId)
      .order("vaccination_date", { ascending: false }),
  ]);

  if (batchError || !batch) {
    return (
      <section>
        <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
          Не удалось загрузить партию.
        </div>
      </section>
    );
  }

  const safeAnimals = animals ?? [];

  const avgCurrentWeight =
    safeAnimals.length > 0
      ? Math.round(
          safeAnimals.reduce(
            (sum, item) => sum + Number(item.current_weight || 0),
            0
          ) / safeAnimals.length
        )
      : 0;

  const totalGain =
    safeAnimals.length > 0
      ? safeAnimals.reduce((sum, item) => {
          const start = Number(item.start_weight || 0);
          const current = Number(item.current_weight || 0);
          return sum + (current - start);
        }, 0)
      : 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Детальная карточка партии</p>
          <h2 className="mt-1 break-words text-3xl font-semibold">
            {batch.batch_name}
          </h2>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/batches/${numericId}/edit`}
            className="inline-flex rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
          >
            Изменить
          </Link>
          <DeleteButton
            table="batches"
            id={numericId}
            confirmMessage={`Удалить партию «${batch.batch_name}»? Действие нельзя отменить.`}
            redirectTo="/batches"
          />
          <Link
            href="/batches"
            className="inline-flex rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
          >
            ← Назад
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Голов в партии" value={String(batch.heads ?? 0)} />
        <StatCard title="Животных в базе" value={String(safeAnimals.length)} />
        <StatCard title="Средний текущий вес" value={`${avgCurrentWeight} кг`} />
        <StatCard title="Суммарный привес" value={`+${totalGain} кг`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <SectionCard title="Информация о партии" eyebrow="Основные данные">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Название</p>
                <p className="mt-1 text-lg font-semibold">{batch.batch_name}</p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Статус</p>
                <div className="mt-2">
                  <StatusBadge status={batch.status || LIVESTOCK_STATUS.SOLD} />
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Средний стартовый вес</p>
                <p className="mt-1 text-lg font-semibold">
                  {batch.start_weight != null ? `${batch.start_weight} кг` : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Средний текущий вес</p>
                <p className="mt-1 text-lg font-semibold">
                  {batch.current_weight != null ? `${batch.current_weight} кг` : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Расходы</p>
                <p className="mt-1 text-lg font-semibold">
                  {batch.expenses != null
                    ? `₸ ${Number(batch.expenses).toLocaleString("ru-RU")}`
                    : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Прогноз прибыли</p>
                <p className="mt-1 text-lg font-semibold text-[#2f6a4f]">
                  {batch.forecast_profit != null
                    ? `₸ ${Number(batch.forecast_profit).toLocaleString("ru-RU")}`
                    : "—"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Животные в партии" eyebrow="Связанные записи">
            {animalsError ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки животных.
              </div>
            ) : safeAnimals.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                В этой партии пока нет животных.
              </div>
            ) : (
              <>
                {/* MOBILE CARDS */}
                <div className="space-y-4 md:hidden">
                  {safeAnimals.map((animal) => {
                    const gain =
                      animal.start_weight != null &&
                      animal.current_weight != null
                        ? Number(animal.current_weight) -
                          Number(animal.start_weight)
                        : null;

                    return (
                      <div
                        key={animal.id}
                        className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {animal.animal_code || "—"}
                            </p>
                            <p className="mt-1 text-sm text-[#6b7280]">
                              Возраст: {animal.age || "—"}
                            </p>
                          </div>

                          <StatusBadge status={animal.status || LIVESTOCK_STATUS.SOLD} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
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

                          <div className="col-span-2 rounded-xl bg-[#f8faf7] p-3">
                            <p className="text-[#6b7280]">Привес</p>
                            <p className="mt-1 font-medium text-[#2f6a4f]">
                              {gain != null ? `+${gain} кг` : "—"}
                            </p>
                          </div>
                        </div>
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
                        <th className="px-4 py-3">Возраст</th>
                        <th className="px-4 py-3">Стартовый вес</th>
                        <th className="px-4 py-3">Текущий вес</th>
                        <th className="px-4 py-3">Привес</th>
                        <th className="px-4 py-3">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeAnimals.map((animal) => {
                        const gain =
                          animal.start_weight != null &&
                          animal.current_weight != null
                            ? Number(animal.current_weight) -
                              Number(animal.start_weight)
                            : null;

                        return (
                          <tr
                            key={animal.id}
                            className="border-t border-[#ebf0e6] bg-white hover:bg-[#fbfcfa]"
                          >
                            <td className="px-4 py-4 font-medium">
                              {animal.animal_code}
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
                              <StatusBadge status={animal.status || LIVESTOCK_STATUS.SOLD} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Вакцинации партии" eyebrow="Ветеринарный учёт">
          <div className="mb-4 flex justify-end">
            <Link
              href={`/vaccines/new?batch_id=${numericId}`}
              className="rounded-2xl bg-[#1f4d3a] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              + Вакцинировать партию
            </Link>
          </div>

          {!batchVaccines || batchVaccines.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Нет записей о вакцинации этой партии.
            </div>
          ) : (
            <div className="space-y-3">
              {batchVaccines.map((v) => {
                const vStatus = getVaccineStatus(v.next_vaccination_date);
                const statusColor =
                  vStatus === VACCINE_STATUS.OVERDUE
                    ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                    : vStatus === VACCINE_STATUS.UPCOMING
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

                return (
                  <div key={v.id} className="rounded-2xl border border-[#ebf0e6] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{v.vaccine_name}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                          {vStatus}
                        </span>
                      </div>
                      <Link
                        href={`/vaccines/${v.id}/edit`}
                        className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                      >
                        Изменить
                      </Link>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Дата</p>
                        <p className="mt-1 font-medium">
                          {new Date(v.vaccination_date).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Следующая</p>
                        <p className={`mt-1 font-medium ${vStatus === VACCINE_STATUS.OVERDUE ? "text-[#b91c1c]" : ""}`}>
                          {v.next_vaccination_date
                            ? new Date(v.next_vaccination_date).toLocaleDateString("ru-RU")
                            : "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Доза</p>
                        <p className="mt-1 font-medium">{v.dose || "—"}</p>
                      </div>
                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Ветеринар</p>
                        <p className="mt-1 font-medium">{v.veterinarian || "—"}</p>
                      </div>
                    </div>

                    {v.vaccine_lot && (
                      <p className="mt-2 text-xs text-[#6b7280]">Серия: {v.vaccine_lot}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}