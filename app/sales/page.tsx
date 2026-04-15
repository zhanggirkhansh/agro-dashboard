export const dynamic = "force-dynamic";

import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import { supabase } from "@/lib/supabase";

export default async function SalesPage() {
  const { data: sales, error } = await supabase
    .from("sales")
    .select(`
      id,
      sale_date,
      weight,
      price_per_kg,
      total_amount,
      livestock (
        animal_code
      ),
      batches (
        batch_name
      )
    `)
    .order("sale_date", { ascending: false });

  const safeSales = sales ?? [];

  const totalSales = safeSales.length;
  const totalRevenue = safeSales.reduce(
    (sum, item: any) => sum + Number(item.total_amount || 0),
    0
  );
  const latestSale = totalSales > 0 ? safeSales[0].sale_date : "—";

  return (
    <section>
      <PageHeader
        eyebrow="Реализация животных"
        title="Продажи"
        actionLabel="+ Продать животное"
        actionHref="/sales/new"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard title="Всего продаж" value={String(totalSales)} />
        <StatCard
          title="Общая выручка"
          value={`₸ ${totalRevenue.toLocaleString("ru-RU")}`}
        />
        <StatCard title="Последняя продажа" value={String(latestSale)} />
      </div>

      <div className="mt-6">
        <SectionCard title="История продаж" eyebrow="Реальные данные из Supabase">
          {error ? (
            <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              Ошибка загрузки продаж.
            </div>
          ) : safeSales.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Пока продаж нет. Добавь первую продажу.
            </div>
          ) : (
            <div className="space-y-4">
              {safeSales.map((sale: any) => (
                <div
                  key={sale.id}
                  className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">
                        {sale.livestock?.animal_code || "Животное не найдено"}
                      </p>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        {sale.batches?.batch_name || "Партия не указана"}
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
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}