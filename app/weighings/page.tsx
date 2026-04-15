export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import { supabase } from "@/lib/supabase";

export default async function WeighingsPage() {
  const { data: weighings, error } = await supabase
    .from("weighings")
    .select(`
      id,
      weighing_date,
      weight,
      comment,
      animal_id,
      livestock (
        animal_code,
        batch
      )
    `)
    .order("weighing_date", { ascending: false });

  const safeWeighings = weighings ?? [];

  const totalWeighings = safeWeighings.length;

  const avgWeight =
    totalWeighings > 0
      ? Math.round(
          safeWeighings.reduce(
            (sum, item) => sum + Number(item.weight || 0),
            0
          ) / totalWeighings
        )
      : 0;

  const latestDate =
    totalWeighings > 0 ? safeWeighings[0].weighing_date : "—";

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Контроль привеса</p>
          <h2 className="mt-1 text-3xl font-semibold">Взвешивания</h2>
        </div>

        <Link
          href="/weighings/new"
          className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
        >
          + Добавить взвешивание
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего взвешиваний" value={String(totalWeighings)} />
        <StatCard title="Средний вес" value={`${avgWeight} кг`} />
        <StatCard title="Последняя дата" value={String(latestDate)} />
        <StatCard
          title="Активность"
          value={totalWeighings > 0 ? "Есть данные" : "Нет данных"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="История взвешиваний"
            eyebrow="Реальные данные из Supabase"
          >
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки взвешиваний.
              </div>
            ) : safeWeighings.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока взвешиваний нет. Добавь первую запись.
              </div>
            ) : (
              <div className="space-y-4">
                {safeWeighings.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          {item.livestock?.animal_code || "Неизвестное животное"}
                        </p>
                        <p className="mt-1 text-sm text-[#6b7280]">
                          {item.livestock?.batch || "Партия не указана"}
                        </p>
                      </div>

                      <p className="text-lg font-semibold text-[#1f4d3a]">
                        {item.weight} кг
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                        <p className="text-[#6b7280]">Дата</p>
                        <p className="mt-1 font-medium">{item.weighing_date}</p>
                      </div>

                      <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                        <p className="text-[#6b7280]">Комментарий</p>
                        <p className="mt-1 font-medium">
                          {item.comment || "Без комментария"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Краткий обзор" eyebrow="Сводка">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Всего записей</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {totalWeighings} взвешиваний в базе.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Средний вес</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {avgWeight} кг по всем записям.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Следующий шаг</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Потом можно сделать график динамики веса по каждому животному.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}