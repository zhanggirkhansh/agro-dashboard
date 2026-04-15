export const dynamic = "force-dynamic";

import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import WeightGainChart from "@/components/weight-gain-chart";
import ExpensesChart from "@/components/expenses-chart";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const [
    { data: livestock },
    { data: batches },
    { data: expenses },
    { data: sales },
    { data: weighings },
    { data: feed },
  ] = await Promise.all([
    supabase.from("livestock").select("id, status"),
    supabase.from("batches").select("id, status, batch_name"),
    supabase
      .from("expenses")
      .select("id, amount, expense_date, category, batch, comment"),
    supabase.from("sales").select("id, total_amount, sale_date"),
    supabase.from("weighings").select("id, weighing_date, weight"),
    supabase.from("feed").select("id, feed_name, quantity, feed_date"),
  ]);

  const safeLivestock = livestock ?? [];
  const safeBatches = batches ?? [];
  const safeExpenses = expenses ?? [];
  const safeSales = sales ?? [];
  const safeWeighings = weighings ?? [];
  const safeFeed = feed ?? [];

  const totalAnimals = safeLivestock.length;

  const activeBatches = safeBatches.filter(
    (item) => item.status === "Активный" || item.status === "Набор массы"
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
    (item) => item.status === "Готовится к продаже"
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
      title: "Расходы",
      value: `₸ ${totalExpenses.toLocaleString("ru-RU")}`,
      change: `${safeExpenses.length} записей`,
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
            <WeightGainChart />
          </SectionCard>
        </div>

        <SectionCard eyebrow="Расходы" title="Структура затрат">
          <ExpensesChart />
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