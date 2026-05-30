export const dynamic = "force-dynamic";

import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import Pagination from "@/components/pagination";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 15;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function SalesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Stats (all sales)
  const { data: allSales } = await supabase
    .from("sales")
    .select("total_amount, sale_date")
    .order("sale_date", { ascending: false });

  const safeAll = allSales ?? [];
  const totalRevenue = safeAll.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const latestSale = safeAll.length > 0 ? safeAll[0].sale_date : "—";

  // Paginated
  const { data: sales, count, error } = await supabase
    .from("sales")
    .select(
      "id, sale_date, weight, price_per_kg, total_amount, livestock(animal_code), batches(batch_name)",
      { count: "exact" }
    )
    .order("sale_date", { ascending: false })
    .range(from, to);

  const safeSales = sales ?? [];
  const totalCount = count ?? 0;

  return (
    <section>
      <PageHeader
        eyebrow="Реализация животных"
        title="Продажи"
        actionLabel="+ Продать животное"
        actionHref="/sales/new"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard title="Всего продаж" value={String(safeAll.length)} />
        <StatCard
          title="Общая выручка"
          value={`₸ ${totalRevenue.toLocaleString("ru-RU")}`}
        />
        <StatCard title="Последняя продажа" value={String(latestSale)} />
      </div>

      <div className="mt-6">
        <SectionCard title="История продаж" eyebrow="Продажи">
          {error ? (
            <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              Ошибка загрузки продаж.
            </div>
          ) : safeSales.length === 0 && page === 1 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Пока продаж нет. Добавь первую продажу.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-sm text-[#6b7280]">Найдено: {totalCount}</div>

              <div className="space-y-4">
                {safeSales.map((sale) => {
                  const animalCode =
                    Array.isArray(sale.livestock)
                      ? sale.livestock[0]?.animal_code
                      : (sale.livestock as { animal_code: string } | null)?.animal_code;

                  const batchName =
                    Array.isArray(sale.batches)
                      ? sale.batches[0]?.batch_name
                      : (sale.batches as { batch_name: string } | null)?.batch_name;

                  return (
                    <div
                      key={sale.id}
                      className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">
                            {animalCode || "Животное не найдено"}
                          </p>
                          <p className="mt-1 text-sm text-[#6b7280]">
                            {batchName || "Партия не указана"}
                          </p>
                        </div>

                        <p className="text-lg font-semibold text-[#1f4d3a]">
                          ₸ {Number(sale.total_amount || 0).toLocaleString("ru-RU")}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Дата продажи</p>
                          <p className="mt-1 font-medium">{sale.sale_date || "—"}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Вес</p>
                          <p className="mt-1 font-medium">
                            {sale.weight != null ? `${sale.weight} кг` : "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                          <p className="text-[#6b7280]">Цена за кг</p>
                          <p className="mt-1 font-medium">
                            {sale.price_per_kg != null
                              ? `₸ ${Number(sale.price_per_kg).toLocaleString("ru-RU")}`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination page={page} totalCount={totalCount} pageSize={PAGE_SIZE} />
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
