export const dynamic = "force-dynamic";

import SectionCard from "@/components/section-card";
import QuickActionButton from "@/components/quick-action-button";
import StatCard from "@/components/stat-card";
import WeightGainChart from "@/components/weight-gain-chart";
import ExpensesChart from "@/components/expenses-chart";
import { createClient } from "@/lib/supabase-server";
import { LIVESTOCK_STATUS } from "@/constants/status";
import { getVaccineStatus, VACCINE_STATUS } from "@/constants/vaccines";
import { formatDate } from "@/lib/format-date";

export default async function Home() {
  const supabase = await createClient();
  const [
    { data: livestock },
    { data: batches },
    { data: expenses },
    { data: sales },
    { data: weighings },
    { data: recentExpenses },
    { data: recentSales },
    { data: recentWeighings },
    { data: recentFeed },
    { data: vaccineAlerts },
  ] = await Promise.all([
    supabase.from("livestock").select("id, status").limit(2000),
    supabase.from("batches").select("id, status").limit(500),
    supabase.from("expenses").select("amount, category").limit(5000),
    supabase.from("sales").select("total_amount").limit(2000),
    supabase.from("weighings").select("animal_id, weighing_date, weight").order("weighing_date", { ascending: true }).limit(5000),
    supabase.from("expenses").select("id, amount, expense_date, category").order("expense_date", { ascending: false }).limit(3),
    supabase.from("sales").select("id, total_amount, sale_date").order("sale_date", { ascending: false }).limit(3),
    supabase.from("weighings").select("id, weight, weighing_date").order("weighing_date", { ascending: false }).limit(3),
    supabase.from("feed").select("id, feed_name, quantity, feed_date").order("feed_date", { ascending: false }).limit(3),
    supabase
      .from("vaccines")
      .select("id, vaccine_name, next_vaccination_date, livestock(animal_code)")
      .not("next_vaccination_date", "is", null)
      .lte("next_vaccination_date", new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0])
      .order("next_vaccination_date", { ascending: true })
      .limit(8),
  ]);

  const safeLivestock = livestock ?? [];
  const safeBatches = batches ?? [];
  const safeExpenses = expenses ?? [];
  const safeSales = sales ?? [];
  const safeWeighings = weighings ?? [];

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
    ...(recentExpenses ?? []).map((item) => ({
      title: "Добавлен расход",
      description: `${item.category || "Расход"} · ₸ ${Number(item.amount || 0).toLocaleString("ru-RU")}`,
      time: formatDate(item.expense_date),
      sortDate: item.expense_date || "",
    })),
    ...(recentSales ?? []).map((item) => ({
      title: "Оформлена продажа",
      description: `Продажа на ₸ ${Number(item.total_amount || 0).toLocaleString("ru-RU")}`,
      time: formatDate(item.sale_date),
      sortDate: item.sale_date || "",
    })),
    ...(recentWeighings ?? []).map((item) => ({
      title: "Добавлено взвешивание",
      description: `Вес: ${Number(item.weight || 0)} кг`,
      time: formatDate(item.weighing_date),
      sortDate: item.weighing_date || "",
    })),
    ...(recentFeed ?? []).map((item) => ({
      title: "Добавлена запись по корму",
      description: `${item.feed_name || "Корм"} · ${Number(item.quantity || 0)}`,
      time: formatDate(item.feed_date),
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
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Общий центр управления</p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Dashboard</h2>
        </div>
        <QuickActionButton />
      </header>

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

        <div className="space-y-5">
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

          <SectionCard eyebrow="Ветеринария" title="Вакцинации" actionLabel="Все" actionHref="/vaccines">
            {!vaccineAlerts || vaccineAlerts.length === 0 ? (
              <div className="rounded-2xl bg-[#f0fdf4] px-4 py-4 text-sm text-[#2f6a4f]">
                Просроченных и предстоящих вакцинаций нет.
              </div>
            ) : (
              <div className="space-y-2">
                {vaccineAlerts.map((v) => {
                  const vStatus = getVaccineStatus(v.next_vaccination_date);
                  const isOverdue = vStatus === VACCINE_STATUS.OVERDUE;
                  const animalCode = Array.isArray(v.livestock)
                    ? v.livestock[0]?.animal_code
                    : (v.livestock as { animal_code: string } | null)?.animal_code;
                  const daysLeft = Math.ceil(
                    (new Date(v.next_vaccination_date!).getTime() - Date.now()) / 86400000
                  );
                  return (
                    <div
                      key={v.id}
                      className={`rounded-2xl p-3 ${isOverdue ? "bg-[#fef2f2]" : "bg-[#fffbf0]"}`}
                    >
                      <p className={`text-sm font-medium ${isOverdue ? "text-[#b91c1c]" : "text-[#92400e]"}`}>
                        {animalCode || "Животное не указано"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">
                        {v.vaccine_name} ·{" "}
                        {isOverdue
                          ? `просрочено ${Math.abs(daysLeft)} дн. назад`
                          : daysLeft === 0
                            ? "сегодня"
                            : `через ${daysLeft} дн.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}