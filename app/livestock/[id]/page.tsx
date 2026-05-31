export const dynamic = "force-dynamic";

import Link from "next/link";
import PageHeader from "@/components/page-header";
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
    { data: animalVaccines },
  ] = await Promise.all([
    supabase
      .from("livestock")
      .select("id, animal_code, age, status, batch, start_weight, current_weight")
      .eq("id", animalId)
      .single(),

    supabase
      .from("weighings")
      .select("id, weight, weighing_date, comment")
      .eq("animal_id", animalId)
      .order("weighing_date", { ascending: true }),

    supabase
      .from("vaccines")
      .select("id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian, vaccine_lot")
      .eq("animal_id", animalId)
      .order("vaccination_date", { ascending: false }),
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

  const chartData =
    weighings?.map((w) => ({
      date: new Date(w.weighing_date).toLocaleDateString("ru-RU"),
      weight: Number(w.weight),
    })) ?? [];

  const currentWeight =
    animal.current_weight != null ? Number(animal.current_weight) : 0;

  const startWeight =
    animal.start_weight != null ? Number(animal.start_weight) : 0;

  const gain =
    animal.start_weight != null && animal.current_weight != null
      ? currentWeight - startWeight
      : 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Карточка животного</p>
          <h2 className="mt-1 text-3xl font-semibold">
            {animal.animal_code || `ID-${animal.id}`}
          </h2>
        </div>
        <div className="flex gap-3">
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
        <StatCard title="Привес" value={`${gain >= 0 ? "+" : ""}${gain} кг`} />
        <StatCard
          title="Количество взвешиваний"
          value={String(chartData.length)}
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