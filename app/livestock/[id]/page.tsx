export const dynamic = "force-dynamic";

import Link from "next/link";
import PageHeader from "@/components/page-header";
import ExportAnimalPDFButton from "@/components/export-animal-pdf-button";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import WeightChart from "@/components/weight-chart";
import { supabase } from "@/lib/supabase";
import { LIVESTOCK_STATUS } from "@/constants/status";
import { getVaccineStatus, VACCINE_STATUS } from "@/constants/vaccines";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnimalPage({ params }: PageProps) {
  const { id } = await params;
  const animalId = Number(id);

  if (Number.isNaN(animalId)) {
    return (
      <section>
        <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
          Некорректный ID животного.
        </div>
      </section>
    );
  }

  const [
    { data: animal, error: animalError },
    { data: weighings, error: weighingsError },
    { data: history },
  ] = await Promise.all([
    supabase
      .from("livestock")
      .select("id, animal_code, age, status, batch, batch_id, start_weight, current_weight, created_at")
      .eq("id", animalId)
      .single(),

    supabase
      .from("weighings")
      .select("id, weight, weighing_date, comment")
      .eq("animal_id", animalId)
      .order("weighing_date", { ascending: true }),

    supabase
      .from("livestock_history")
      .select("id, changed_at, changed_by, old_status, new_status, old_weight, new_weight, old_batch, new_batch")
      .eq("animal_id", animalId)
      .order("changed_at", { ascending: false })
      .limit(20),
  ]);

  if (animalError || !animal) {
    return (
      <section>
        <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
          Не удалось загрузить карточку животного.
        </div>
      </section>
    );
  }

  // Загружаем вакцины: индивидуальные + партийные (animal_id = null)
  const vaccineQueries = [
    supabase
      .from("vaccines")
      .select("id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian, vaccine_lot")
      .eq("animal_id", animalId)
      .order("vaccination_date", { ascending: false }),
  ];

  if (animal.batch_id) {
    vaccineQueries.push(
      supabase
        .from("vaccines")
        .select("id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian, vaccine_lot")
        .eq("batch_id", animal.batch_id)
        .is("animal_id", null)
        .order("vaccination_date", { ascending: false })
    );
  }

  const vaccineResults = await Promise.all(vaccineQueries);
  const seenIds = new Set<number>();
  const animalVaccines = vaccineResults
    .flatMap((r) => r.data ?? [])
    .filter((v) => {
      if (seenIds.has(v.id)) return false;
      seenIds.add(v.id);
      return true;
    })
    .sort((a, b) => b.vaccination_date.localeCompare(a.vaccination_date));

  const safeWeighings = weighings ?? [];

  const chartData = safeWeighings.map((w) => ({
    date: new Date(w.weighing_date).toLocaleDateString("ru-RU"),
    weight: Number(w.weight),
  }));

  const currentWeight =
    animal.current_weight != null ? Number(animal.current_weight) : 0;

  const startWeight =
    animal.start_weight != null ? Number(animal.start_weight) : 0;

  const gain =
    animal.start_weight != null && animal.current_weight != null
      ? currentWeight - startWeight
      : 0;

  // Суточный привес
  let dailyGainG: number | null = null;
  if (safeWeighings.length >= 2) {
    // Два и более взвешивания: первое vs последнее
    const first = safeWeighings[0];
    const last = safeWeighings[safeWeighings.length - 1];
    const days = Math.max(
      1,
      Math.round(
        (new Date(last.weighing_date).getTime() - new Date(first.weighing_date).getTime()) /
          86400000
      )
    );
    dailyGainG = Math.round(((Number(last.weight) - Number(first.weight)) / days) * 1000);
  } else if (safeWeighings.length === 1 && animal.start_weight != null && animal.created_at) {
    // Одно взвешивание: start_weight + created_at как базовая точка
    const weighing = safeWeighings[0];
    const days = Math.max(
      1,
      Math.round(
        (new Date(weighing.weighing_date).getTime() - new Date(animal.created_at).getTime()) /
          86400000
      )
    );
    dailyGainG = Math.round(
      ((Number(weighing.weight) - Number(animal.start_weight)) / days) * 1000
    );
  }

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Карточка животного</p>
          <h2 className="mt-1 text-3xl font-semibold">
            {animal.animal_code || `ID-${animal.id}`}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportAnimalPDFButton animalId={animal.id} animalCode={animal.animal_code} />
          <Link
            href={`/weighings/new?animal_id=${animal.id}`}
            className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
          >
            + Взвесить
          </Link>
          <Link
            href={`/livestock/${animal.id}/edit`}
            className="inline-flex rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
          >
            Изменить
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Текущий вес" value={`${currentWeight} кг`} />
        <StatCard title="Общий привес" value={`${gain >= 0 ? "+" : ""}${gain} кг`} />
        <StatCard
          title="Суточный привес"
          value={dailyGainG !== null ? `${dailyGainG > 0 ? "+" : ""}${dailyGainG} г/день` : "—"}
          change={dailyGainG === null ? "Нужно взвешивание" : undefined}
        />
        <StatCard title="Статус" value={animal.status || LIVESTOCK_STATUS.ACTIVE} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Динамика веса" eyebrow="История измерений">
            {chartData.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока нет данных по взвешиваниям.
              </div>
            ) : (
              <WeightChart data={chartData} startWeight={startWeight || undefined} />
            )}
          </SectionCard>
        </div>

        <SectionCard title="Информация" eyebrow="Основные данные">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <p className="text-[#6b7280]">ID</p>
              <p className="font-medium">{animal.id}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Код животного</p>
              <p className="font-medium">{animal.animal_code || "—"}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Возраст</p>
              <p className="font-medium">{animal.age || "—"}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Партия</p>
              <p className="font-medium">{animal.batch || "—"}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Стартовый вес</p>
              <p className="font-medium">
                {animal.start_weight != null ? `${animal.start_weight} кг` : "—"}
              </p>
            </div>

            <div>
              <p className="text-[#6b7280]">Текущий вес</p>
              <p className="font-medium">
                {animal.current_weight != null
                  ? `${animal.current_weight} кг`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-[#6b7280]">Статус</p>
              <p className="font-medium">{animal.status || LIVESTOCK_STATUS.ACTIVE}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="История взвешиваний" eyebrow="Последние записи">
          {weighingsError ? (
            <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
              Ошибка загрузки взвешиваний.
            </div>
          ) : chartData.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Нет данных по взвешиваниям.
            </div>
          ) : (
            <div className="space-y-3">
              {weighings!.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(item.weighing_date).toLocaleDateString("ru-RU")}
                      </p>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        {item.comment || "Без комментария"}
                      </p>
                    </div>

                    <p className="font-semibold text-[#1f4d3a]">
                      {item.weight} кг
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* История изменений */}
      {history && history.length > 0 && (
        <div className="mt-6">
          <SectionCard title="История изменений" eyebrow="Аудит">
            <div className="space-y-3">
              {history.map((h) => {
                const changes: string[] = [];
                if (h.old_status !== h.new_status) {
                  changes.push(`Статус: «${h.old_status ?? "—"}» → «${h.new_status ?? "—"}»`);
                }
                if (h.old_weight !== h.new_weight) {
                  changes.push(`Вес: ${h.old_weight ?? "—"} → ${h.new_weight ?? "—"} кг`);
                }
                if (h.old_batch !== h.new_batch) {
                  changes.push(`Партия: «${h.old_batch ?? "—"}» → «${h.new_batch ?? "—"}»`);
                }

                return (
                  <div
                    key={h.id}
                    className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm">
                        {changes.map((c, i) => (
                          <p key={i} className="font-medium">{c}</p>
                        ))}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-[#6b7280]">
                          {new Date(h.changed_at).toLocaleString("ru-RU")}
                        </p>
                        {h.changed_by && (
                          <p className="text-xs text-[#6b7280]">{h.changed_by}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Вакцинации */}
      <div className="mt-6">
        <SectionCard
          title="История вакцинаций"
          eyebrow="Ветеринарный учёт"
          actionLabel="+ Вакцинировать"
          actionHref={`/vaccines/new?animal_id=${animal.id}`}
        >
          {!animalVaccines || animalVaccines.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Нет записей о вакцинации.{" "}
              <Link href={`/vaccines/new?animal_id=${animal.id}`} className="text-[#1f4d3a] underline underline-offset-2">
                Добавить
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {animalVaccines.map((v) => {
                const vStatus = getVaccineStatus(v.next_vaccination_date);
                const statusColor =
                  vStatus === VACCINE_STATUS.OVERDUE
                    ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                    : vStatus === VACCINE_STATUS.UPCOMING
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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