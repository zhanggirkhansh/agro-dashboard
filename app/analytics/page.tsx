export const dynamic = "force-dynamic";

import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import ProfitChart from "@/components/profit-chart";
import RevenueExpenseChart from "@/components/revenue-expense-chart";
import { supabase } from "@/lib/supabase";

export default async function AnalyticsPage() {
  const [{ data: batches }, { data: expenses }, { data: sales }, { data: livestock }] =
    await Promise.all([
      supabase.from("batches").select("id, batch_name"),
      supabase.from("expenses").select("amount, batch_id"),
      supabase.from("sales").select("total_amount, batch_id"),
      supabase.from("livestock").select("id, batch_id, start_weight, current_weight"),
    ]);

  const safeBatches = batches ?? [];
  const safeExpenses = expenses ?? [];
  const safeSales = sales ?? [];
  const safeLivestock = livestock ?? [];

  const analytics = safeBatches.map((batch: any) => {
    const batchExpenses = safeExpenses
      .filter((e: any) => e.batch_id === batch.id)
      .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

    const batchRevenue = safeSales
      .filter((s: any) => s.batch_id === batch.id)
      .reduce((sum: number, s: any) => sum + Number(s.total_amount || 0), 0);

    const batchAnimals = safeLivestock.filter((a: any) => a.batch_id === batch.id);

    const totalGain = batchAnimals.reduce((sum: number, animal: any) => {
      const start = Number(animal.start_weight || 0);
      const current = Number(animal.current_weight || 0);
      return sum + (current - start);
    }, 0);

    const avgGain =
      batchAnimals.length > 0 ? Math.round(totalGain / batchAnimals.length) : 0;

    const profit = batchRevenue - batchExpenses;

    return {
      id: batch.id,
      name: batch.batch_name,
      revenue: batchRevenue,
      expenses: batchExpenses,
      profit,
      animals: batchAnimals.length,
      totalGain,
      avgGain,
    };
  });

  const totalRevenue = analytics.reduce((s, i) => s + i.revenue, 0);
  const totalExpenses = analytics.reduce((s, i) => s + i.expenses, 0);
  const totalProfit = analytics.reduce((s, i) => s + i.profit, 0);

  const totalAnimals = analytics.reduce((s, i) => s + i.animals, 0);
  const totalGain = analytics.reduce((s, i) => s + i.totalGain, 0);
  const avgGainOverall =
    totalAnimals > 0 ? Math.round(totalGain / totalAnimals) : 0;

  const topBatches = [...analytics]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  return (
    <section>
      <PageHeader eyebrow="Финансы и эффективность" title="Аналитика" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Выручка"
          value={`₸ ${totalRevenue.toLocaleString("ru-RU")}`}
        />
        <StatCard
          title="Расходы"
          value={`₸ ${totalExpenses.toLocaleString("ru-RU")}`}
        />
        <StatCard
          title="Прибыль"
          value={`₸ ${totalProfit.toLocaleString("ru-RU")}`}
        />
        <StatCard
          title="Средний привес"
          value={`${avgGainOverall} кг`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Прибыль по партиям" eyebrow="Сравнение партий">
          {analytics.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Пока нет данных для графика.
            </div>
          ) : (
            <ProfitChart data={analytics} />
          )}
        </SectionCard>

        <SectionCard title="Расходы vs доход" eyebrow="Финансовая динамика">
          {analytics.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Пока нет данных для графика.
            </div>
          ) : (
            <RevenueExpenseChart data={analytics} />
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Детализация по партиям" eyebrow="Полная сводка">
            {analytics.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока нет данных для аналитики.
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-[#6b7280]">
                          Животных: {item.animals} · Средний привес: {item.avgGain} кг
                        </p>
                      </div>

                      <p
                        className={
                          item.profit >= 0
                            ? "font-semibold text-green-700"
                            : "font-semibold text-red-600"
                        }
                      >
                        ₸ {item.profit.toLocaleString("ru-RU")}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">
                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Доход</p>
                        <p className="mt-1 font-medium">
                          ₸ {item.revenue.toLocaleString("ru-RU")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Расход</p>
                        <p className="mt-1 font-medium">
                          ₸ {item.expenses.toLocaleString("ru-RU")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Прибыль</p>
                        <p
                          className={
                            item.profit >= 0
                              ? "mt-1 font-medium text-[#2f6a4f]"
                              : "mt-1 font-medium text-[#b91c1c]"
                          }
                        >
                          ₸ {item.profit.toLocaleString("ru-RU")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f8faf7] p-3">
                        <p className="text-[#6b7280]">Суммарный привес</p>
                        <p className="mt-1 font-medium">{item.totalGain} кг</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Топ партии" eyebrow="Лидеры по прибыли">
          {topBatches.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Пока нет данных для рейтинга.
            </div>
          ) : (
            <div className="space-y-4">
              {topBatches.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#f8faf7] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-[#6b7280]">
                        #{index + 1} в рейтинге
                      </p>
                      <p className="mt-1 font-semibold">{item.name}</p>
                    </div>

                    <p className="font-semibold text-[#2f6a4f]">
                      ₸ {item.profit.toLocaleString("ru-RU")}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-[#6b7280]">
                    Животных: {item.animals} · Средний привес: {item.avgGain} кг
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}