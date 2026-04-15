export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import { supabase } from "@/lib/supabase";

export default async function FeedPage() {
  const { data: feed, error } = await supabase
    .from("feed")
    .select(`
      id,
      feed_name,
      quantity,
      unit,
      feed_date,
      cost,
      batch_id,
      batches (
        batch_name
      )
    `)
    .order("feed_date", { ascending: false });

  const safeFeed = feed ?? [];

  const totalRecords = safeFeed.length;

  const totalQuantity = safeFeed.reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0),
    0
  );

  const totalCost = safeFeed.reduce(
    (sum: number, item: any) => sum + Number(item.cost || 0),
    0
  );

  const lastDate = totalRecords > 0 ? safeFeed[0].feed_date : "—";

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Учет кормов</p>
          <h2 className="mt-1 text-3xl font-semibold">Корма</h2>
        </div>

        <Link
          href="/feed/new"
          className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
        >
          + Добавить корм
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего записей" value={String(totalRecords)} />
        <StatCard title="Общий объем" value={`${totalQuantity} ед.`} />
        <StatCard
          title="Общая стоимость"
          value={`₸ ${totalCost.toLocaleString("ru-RU")}`}
        />
        <StatCard title="Последняя дата" value={String(lastDate)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="История кормов"
            eyebrow="Реальные данные из Supabase"
          >
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки кормов.
              </div>
            ) : safeFeed.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока записей по кормам нет. Добавь первую запись.
              </div>
            ) : (
              <div className="space-y-4">
                {safeFeed.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">{item.feed_name}</p>
                        <p className="mt-1 text-sm text-[#6b7280]">
                          {item.batches?.[0]?.batch_name || "Без партии"}
                        </p>
                      </div>

                      <p className="text-lg font-semibold text-[#1f4d3a]">
                        {item.quantity} {item.unit}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                        <p className="text-[#6b7280]">Дата</p>
                        <p className="mt-1 font-medium">{item.feed_date || "—"}</p>
                      </div>

                      <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                        <p className="text-[#6b7280]">Стоимость</p>
                        <p className="mt-1 font-medium">
                          {item.cost != null
                            ? `₸ ${Number(item.cost).toLocaleString("ru-RU")}`
                            : "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                        <p className="text-[#6b7280]">Партия</p>
                        <p className="mt-1 font-medium">
                          {item.batches?.[0]?.batch_name || "Не указана"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Быстрый обзор" eyebrow="Сводка по кормам">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Всего записей</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {totalRecords} записей по кормам в базе.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Общая стоимость</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                ₸ {totalCost.toLocaleString("ru-RU")}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Следующий шаг</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Потом можно будет связать корма с аналитикой по расходу на партию.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}