export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import Pagination from "@/components/pagination";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/format-date";

const PAGE_SIZE = 15;

type Props = {
  searchParams: Promise<{ batch?: string; page?: string }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const { batch, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Stats (all feed records)
  const { data: allFeed } = await supabase
    .from("feed")
    .select("quantity, cost, feed_date");

  const safeAll = allFeed ?? [];
  const totalQuantity = safeAll.reduce((sum, f) => sum + Number(f.quantity || 0), 0);
  const totalCost = safeAll.reduce((sum, f) => sum + Number(f.cost || 0), 0);
  const lastDate = safeAll.length > 0 ? safeAll[0].feed_date : "—";

  // Batches for filter
  const { data: batches } = await supabase
    .from("batches")
    .select("id, batch_name")
    .order("created_at", { ascending: false });

  // Paginated + filtered
  let query = supabase
    .from("feed")
    .select(
      "id, feed_name, quantity, unit, feed_date, cost, batch_id, batches(batch_name)",
      { count: "exact" }
    )
    .order("feed_date", { ascending: false })
    .range(from, to);

  if (batch) query = query.eq("batch_id", Number(batch));

  const { data: feed, count, error } = await query;

  const safeFeed = feed ?? [];
  const totalCount = count ?? 0;

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
        <StatCard title="Всего записей" value={String(safeAll.length)} />
        <StatCard title="Общий объем" value={`${totalQuantity} ед.`} />
        <StatCard
          title="Общая стоимость"
          value={`₸ ${totalCost.toLocaleString("ru-RU")}`}
        />
        <StatCard title="Последняя дата" value={formatDate(lastDate)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="История кормов" eyebrow="Корма">
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки кормов.
              </div>
            ) : (
              <div className="space-y-5">
                {/* Фильтр по партии */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/feed"
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      !batch
                        ? "bg-[#1f4d3a] text-white"
                        : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                    }`}
                  >
                    Все партии
                  </Link>
                  {(batches ?? []).map((b) => (
                    <Link
                      key={b.id}
                      href={`/feed?batch=${b.id}`}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        batch === String(b.id)
                          ? "bg-[#1f4d3a] text-white"
                          : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                      }`}
                    >
                      {b.batch_name}
                    </Link>
                  ))}
                </div>

                <div className="text-sm text-[#6b7280]">Найдено: {totalCount}</div>

                {safeFeed.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                    Пока записей по кормам нет. Добавь первую запись.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeFeed.map((item) => {
                      const batchName =
                        Array.isArray(item.batches)
                          ? item.batches[0]?.batch_name
                          : (item.batches as { batch_name: string } | null)?.batch_name;

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-lg font-semibold">{item.feed_name}</p>
                              <p className="mt-1 text-sm text-[#6b7280]">
                                {batchName || "Без партии"}
                              </p>
                            </div>

                            <p className="text-lg font-semibold text-[#1f4d3a]">
                              {item.quantity} {item.unit}
                            </p>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                            <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                              <p className="text-[#6b7280]">Дата</p>
                              <p className="mt-1 font-medium">{formatDate(item.feed_date)}</p>
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
                                {batchName || "Не указана"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end">
                            <Link
                              href={`/feed/${item.id}/edit`}
                              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                            >
                              Изменить
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Pagination page={page} totalCount={totalCount} pageSize={PAGE_SIZE} />
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Быстрый обзор" eyebrow="Сводка по кормам">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Всего записей</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {safeAll.length} записей по кормам в базе.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Общая стоимость</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                ₸ {totalCost.toLocaleString("ru-RU")}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
