export const dynamic = "force-dynamic";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import { supabase } from "@/lib/supabase";
import ProfitChart from "@/components/profit-chart";

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

      <div className="grid grid-cols-3 gap-5">
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
        <SectionCard title="Прибыль по партиям">
          <ProfitChart data={analytics} />
        </SectionCard>
        <SectionCard title="Детализация по партиям">
          <div className="space-y-4">
            {analytics.map((item: any) => (
              <div key={item.name} className="p-4 border rounded-2xl">
                <div className="flex justify-between">
                  <p className="font-semibold">{item.name}</p>
                  <p
                    className={
                      item.profit >= 0
                        ? "text-green-700"
                        : "text-red-600"
                    }
                  >
                    ₸ {item.profit.toLocaleString("ru-RU")}
                  </p>
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  Доход: ₸ {item.revenue.toLocaleString("ru-RU")} ·
                  Расход: ₸ {item.expenses.toLocaleString("ru-RU")}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}