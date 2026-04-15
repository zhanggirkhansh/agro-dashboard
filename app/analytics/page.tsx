export const dynamic = "force-dynamic";

import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import ProfitChart from "@/components/profit-chart";
import { supabase } from "@/lib/supabase";

export default async function AnalyticsPage() {
  const [{ data: batches }, { data: expenses }, { data: sales }] =
    await Promise.all([
      supabase.from("batches").select("id, batch_name"),
      supabase.from("expenses").select("amount, batch_id"),
      supabase.from("sales").select("total_amount, batch_id"),
    ]);

  const safeBatches = batches ?? [];
  const safeExpenses = expenses ?? [];
  const safeSales = sales ?? [];

  const analytics = safeBatches.map((batch: any) => {
    const batchExpenses = safeExpenses
      .filter((e: any) => e.batch_id === batch.id)
      .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

    const batchRevenue = safeSales
      .filter((s: any) => s.batch_id === batch.id)
      .reduce((sum: number, s: any) => sum + Number(s.total_amount || 0), 0);

    const profit = batchRevenue - batchExpenses;

    return {
      name: batch.batch_name,
      revenue: batchRevenue,
      expenses: batchExpenses,
      profit,
    };
  });

  const totalRevenue = analytics.reduce((s, i) => s + i.revenue, 0);
  const totalExpenses = analytics.reduce((s, i) => s + i.expenses, 0);
  const totalProfit = analytics.reduce((s, i) => s + i.profit, 0);

  return (
    <section>
      <PageHeader eyebrow="Финансы" title="Аналитика прибыли" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>

      <div className="mt-6 space-y-6">
        <SectionCard title="Прибыль по партиям" eyebrow="График">
          <div className="overflow-hidden">
            <ProfitChart data={analytics} />
          </div>
        </SectionCard>

        <SectionCard title="Детализация по партиям" eyebrow="Сводка">
          {analytics.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Пока нет данных для аналитики.
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((item: any) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <p className="font-semibold">{item.name}</p>
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

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
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