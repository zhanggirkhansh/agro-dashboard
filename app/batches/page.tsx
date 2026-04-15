export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { supabase } from "@/lib/supabase";

export default async function BatchesPage() {
  const { data: batches, error } = await supabase
    .from("batches")
    .select("*")
    .order("created_at", { ascending: false });

  const safeBatches = batches ?? [];

  const totalBatches = safeBatches.length;
  const activeBatches = safeBatches.filter(
    (item) => item.status === "Активный"
  ).length;
  const readyBatches = safeBatches.filter(
    (item) => item.status === "Готовится к продаже"
  ).length;

  const avgForecast =
    safeBatches.length > 0
      ? Math.round(
          safeBatches.reduce(
            (sum, item) => sum + Number(item.forecast_profit || 0),
            0
          ) / safeBatches.length
        )
      : 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Управление циклами откорма</p>
          <h2 className="mt-1 text-3xl font-semibold">Партии</h2>
        </div>

        <Link
          href="/batches/new"
          className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
        >
          + Создать партию
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего партий" value={String(totalBatches)} />
        <StatCard title="Активный откорм" value={String(activeBatches)} />
        <StatCard title="Готовы к продаже" value={String(readyBatches)} />
        <StatCard
          title="Средний прогноз прибыли"
          value={`₸ ${avgForecast.toLocaleString("ru-RU")}`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Текущие партии"
            eyebrow="Реальные данные из Supabase"
          >
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки партий.
              </div>
            ) : safeBatches.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока партий нет. Создай первую запись.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {safeBatches.map((batch) => {
                  const gain =
                    batch.start_weight != null && batch.current_weight != null
                      ? Number(batch.current_weight) - Number(batch.start_weight)
                      : null;

                  return (
                    <div
                      key={batch.id}
                      className="rounded-3xl border border-[#ebf0e6] bg-[#fcfdfb] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-[#6b7280]">Партия</p>
                          <h3 className="mt-1 text-2xl font-semibold">
                            {batch.batch_name}
                          </h3>
                        </div>
                        <StatusBadge status={batch.status || "Продан"} />
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Количество голов</p>
                          <p className="mt-1 font-semibold">{batch.heads ?? "—"}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Привес</p>
                          <p className="mt-1 font-semibold text-[#2f6a4f]">
                            {gain != null ? `+${gain} кг` : "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Стартовый вес</p>
                          <p className="mt-1 font-semibold">
                            {batch.start_weight != null
                              ? `${batch.start_weight} кг`
                              : "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Текущий вес</p>
                          <p className="mt-1 font-semibold">
                            {batch.current_weight != null
                              ? `${batch.current_weight} кг`
                              : "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Расходы</p>
                          <p className="mt-1 font-semibold">
                            {batch.expenses != null
                              ? `₸ ${Number(batch.expenses).toLocaleString("ru-RU")}`
                              : "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Прогноз прибыли</p>
                          <p className="mt-1 font-semibold text-[#2f6a4f]">
                            {batch.forecast_profit != null
                              ? `₸ ${Number(batch.forecast_profit).toLocaleString("ru-RU")}`
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={`/batches/${batch.id}`}
                          className="flex-1 rounded-2xl bg-[#1f4d3a] px-4 py-3 text-center font-medium text-white hover:opacity-90"
                        >
                          Открыть партию
                        </Link>

                        <button className="rounded-2xl bg-white px-4 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]">
                          Изменить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Быстрый обзор" eyebrow="Сводка по партиям">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Всего партий</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {totalBatches} записей в базе.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Активные партии</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {activeBatches} партий сейчас в активной фазе.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Готовы к продаже</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {readyBatches} партий близки к реализации.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}