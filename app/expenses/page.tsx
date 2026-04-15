export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import { supabase } from "@/lib/supabase";

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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Финансовый учет</p>
          <h2 className="mt-1 text-3xl font-semibold">Расходы</h2>
        </div>

        <Link
          href="/expenses/new"
          className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 text-white"
        >
          + Добавить расход
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
            <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              Ошибка загрузки.
            </div>
          ) : safeExpenses.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Нет расходов.
            </div>
          ) : (
            <div className="space-y-4">
              {safeExpenses.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.category}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.batches?.[0]?.batch_name || "Без партии"}
                      </p>
                    </div>

                    <p className="font-semibold text-[#1f4d3a]">
                      ₸ {Number(item.amount).toLocaleString("ru-RU")}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-[#f8faf7] p-3">
                      <p className="text-[#6b7280]">Дата</p>
                      <p className="mt-1 font-medium">
                        {item.expense_date || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f8faf7] p-3">
                      <p className="text-[#6b7280]">Поставщик</p>
                      <p className="mt-1 font-medium">
                        {item.supplier || "Не указан"}
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