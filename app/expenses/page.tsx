import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ExpensesPage() {
  const { data: expenses, error } = await supabase
    .from("expenses")
    .select(`
      id,
      category,
      amount,
      expense_date,
      supplier,
      batch_id,
      batches (
        batch_name
      )
    `)
    .order("expense_date", { ascending: false });

  const safeExpenses = expenses ?? [];

  const total = safeExpenses.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0),
    0
  );

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Финансовый учет</p>
          <h2 className="mt-1 text-3xl font-semibold">Расходы</h2>
        </div>

        <Link
          href="/expenses/new"
          className="rounded-2xl bg-[#1f4d3a] px-5 py-3 text-white"
        >
          + Добавить расход
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <StatCard title="Всего расходов" value={String(safeExpenses.length)} />
        <StatCard
          title="Общая сумма"
          value={`₸ ${total.toLocaleString("ru-RU")}`}
        />
        <StatCard title="Активность" value="Есть данные" />
      </div>

      <div className="mt-6">
        <SectionCard title="История расходов" eyebrow="Связь через batch_id">
          {error ? (
            <div className="text-red-500">Ошибка загрузки</div>
          ) : safeExpenses.length === 0 ? (
            <div>Нет расходов</div>
          ) : (
            <div className="space-y-4">
              {safeExpenses.map((item: any) => (
                <div key={item.id} className="border p-4 rounded-2xl">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.category}</p>
                      <p className="text-sm text-gray-500">
                        {item.batches?.[0]?.batch_name || "Без партии"}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₸ {Number(item.amount).toLocaleString("ru-RU")}
                    </p>
                  </div>

                  <div className="text-sm mt-2 text-gray-500">
                    {item.expense_date}
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