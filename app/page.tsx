export const dynamic = "force-dynamic";

import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import WeightGainChart from "@/components/weight-gain-chart";
import ExpensesChart from "@/components/expenses-chart";
import { supabase } from "@/lib/supabase";
import { LIVESTOCK_STATUS } from "@/constants/status";

export default async function Home() {
  const [
    { data: livestock },
    { data: batches },
    { data: expenses },
    { data: sales },
    { data: weighings },
    { data: feed },
  ] = await Promise.all([
    supabase.from("livestock").select("id, status, start_weight, created_at"),
    supabase.from("batches").select("id, status, batch_name"),
    supabase
      .from("expenses")
      .select("id, amount, expense_date, category, batch, comment"),
    supabase.from("sales").select("id, total_amount, sale_date"),
    supabase.from("weighings").select("id, animal_id, weighing_date, weight").order("weighing_date", { ascending: true }),
    supabase.from("feed").select("id, feed_name, quantity, feed_date"),
  ]);

  const safeLivestock = livestock ?? [];
  const safeBatches = batches ?? [];
  const safeExpenses = expenses ?? [];
  const safeSales = sales ?? [];
  const safeWeighings = weighings ?? [];
  const safeFeed = feed ?? [];

  // WeightGainChart: средний вес по месяцам
  const weightByMonth = safeWeighings.reduce<Record<string, number[]>>((acc, w) => {
    if (!w.weighing_date) return acc;
    const d = new Date(w.weighing_date);
    const key = d.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(Number(w.weight || 0));
    return acc;
  }, {});
  const weightChartData = Object.entries(weightByMonth).map(([name, vals]) => ({
    name,
    value: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
  }));

  // ExpensesChart: сумма расходов по категориям
  const expenseByCategory = safeExpenses.reduce<Record<string, number>>((acc, e) => {
    const cat = e.category || "Прочее";
    acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
  const expensesChartData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  // Суточный привес по всем животным (средний)
  const byAnimal = safeWeighings.reduce<Record<number, typeof safeWeighings>>((acc, w) => {
    if (!w.animal_id) return acc;
    if (!acc[w.animal_id]) acc[w.animal_id] = [];
    acc[w.animal_id].push(w);
    return acc;
  }, {});

  const livestockMap = Object.fromEntries(
    safeLivestock.map((a) => [a.id, a])
  );

  const dailyGainsG = Object.entries(byAnimal)
    .map(([animalIdStr, ws]) => {
      if (ws.length >= 2) {
        const first = ws[0];
        const last = ws[ws.length - 1];
        const days = Math.max(
          1,
          Math.round((new Date(last.weighing_date).getTime() - new Date(first.weighing_date).getTime()) / 86400000)
        );
        return ((Number(last.weight) - Number(first.weight)) / days) * 1000;
      }
      // Одно взвешивание — используем start_weight + created_at
      const animal = livestockMap[Number(animalIdStr)];
      if (ws.length === 1 && animal?.start_weight != null && animal?.created_at) {
        const days = Math.max(
          1,
          Math.round((new Date(ws[0].weighing_date).getTime() - new Date(animal.created_at).getTime()) / 86400000)
        );
        return ((Number(ws[0].weight) - Number(animal.start_weight)) / days) * 1000;
      }
      return null;
    })
    .filter((v): v is number => v !== null);

  const avgDailyGainG =
    dailyGainsG.length > 0
      ? Math.round(dailyGainsG.reduce((s, v) => s + v, 0) / dailyGainsG.length)
      : null;

  const totalAnimals = safeLivestock.length;

  const activeBatches = safeBatches.filter(
    (item) => item.status === LIVESTOCK_STATUS.ACTIVE || item.status === LIVESTOCK_STATUS.GAINING
  ).length;

  const totalExpenses = safeExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalRevenue = safeSales.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );

  const totalProfit = totalRevenue - totalExpenses;

  const readyForSale = safeLivestock.filter(
    (item) => item.status === LIVESTOCK_STATUS.READY_FOR_SALE
  ).length;

  const recentActivities = [
    ...safeExpenses.slice(0, 3).map((item) => ({
      title: "Добавлен расход",
      description: `${item.category || "Расход"} · ₸ ${Number(
        item.amount || 0
      ).toLocaleString("ru-RU")}`,
      time: item.expense_date || "—",
      sortDate: item.expense_date || "",
    })),
    ...safeSales.slice(0, 3).map((item) => ({
      title: "Оформлена продажа",
      description: `Продажа на ₸ ${Number(item.total_amount || 0).toLocaleString(
        "ru-RU"
      )}`,
      time: item.sale_date || "—",
      sortDate: item.sale_date || "",
    })),
    ...safeWeighings.slice(0, 3).map((item) => ({
      title: "Добавлено взвешивание",
      description: `Вес: ${Number(item.weight || 0)} кг`,
      time: item.weighing_date || "—",
      sortDate: item.weighing_date || "",
    })),
    ...safeFeed.slice(0, 3).map((item) => ({
      title: "Добавлена запись по корму",
      description: `${item.feed_name || "Корм"} · ${Number(
        item.quantity || 0
      )}`,
      time: item.feed_date || "—",
      sortDate: item.feed_date || "",
    })),
  ]
    .sort((a, b) => String(b.sortDate).localeCompare(String(a.sortDate)))
    .slice(0, 6);

  const signals = [
    {
      title: "Животные к продаже",
      description: `${readyForSale} животных сейчас имеют статус «Готовится к продаже».`,
    },
    {
      title: "Активные партии",
      description: `${activeBatches} партий находятся в активной фазе откорма.`,
    },
    {
      title: "Финансовый итог",
      description: `Текущая расчетная прибыль: ₸ ${totalProfit.toLocaleString("ru-RU")}.`,
    },
  ];

  const stats = [
    {
      title: "Общее поголовье",
      value: String(totalAnimals),
      change: `${readyForSale} готовы к продаже`,
    },
    {
      title: "Активные партии",
      value: String(activeBatches),
      change: `${safeBatches.length} всего партий`,
    },
    {
      title: "Суточный привес",
      value: avgDailyGainG !== null ? `${avgDailyGainG > 0 ? "+" : ""}${avgDailyGainG} г/день` : "—",
      change: avgDailyGainG !== null ? "Среднее по хозяйству" : "Нужно ≥ 2 взвешивания",
    },
    {
      title: "Прибыль",
      value: `₸ ${totalProfit.toLocaleString("ru-RU")}`,
      change: `Выручка: ₸ ${totalRevenue.toLocaleString("ru-RU")}`,
    },
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Общий центр управления"
        title="Dashboard"
        actionLabel="+ Быстрое действие"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard eyebrow="Динамика" title="Обзор привеса">
            <div className="mb-4 flex justify-end">
              <span className="rounded-full bg-[#edf5ee] px-3 py-1 text-sm text-[#2f6a4f]">
                По текущим данным
              </span>
            </div>
            <WeightGainChart data={weightChartData} />
          </SectionCard>
        </div>

        <SectionCard eyebrow="Расходы" title="Структура затрат">
          <ExpensesChart data={expensesChartData} />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            eyebrow="Последние действия"
            title="Журнал операций"
            actionLabel="Обновить"
          >
            {recentActivities.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока данных по операциям нет.
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.title + activity.time + activity.description}
                    className="rounded-2xl border border-[#ebf0e6] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="mt-1 text-sm text-[#6b7280]">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-sm text-[#94a3b8]">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard eyebrow="Сигналы" title="Ключевые показатели">
          <div className="space-y-4">
            {signals.map((signal) => (
              <div key={signal.title} className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="font-medium">{signal.title}</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}