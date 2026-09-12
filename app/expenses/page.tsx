export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import Pagination from "@/components/pagination";
import ExportExpensesButton from "@/components/export-expenses-button";
import DeleteButton from "@/components/delete-button";
import ExpensesFilters from "@/components/expenses-filters";
import { createClient } from "@/lib/supabase-server";
import { formatDate } from "@/lib/format-date";

const PAGE_SIZE = 15;

type Props = {
  searchParams: Promise<{
    category?: string;
    supplier?: string;
    batch?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
  }>;
};

export default async function ExpensesPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { category, supplier, batch, date_from, date_to, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ data: allExpenses }, { data: batches }] = await Promise.all([
    supabase.from("expenses").select("amount, category"),
    supabase.from("batches").select("id, batch_name").order("created_at", { ascending: false }),
  ]);

  const safeAll = allExpenses ?? [];
  const total = safeAll.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const categories = Array.from(new Set(safeAll.map((e) => e.category).filter(Boolean)));

  // Filtered paginated query
  let query = supabase
    .from("expenses")
    .select(
      "id, category, amount, expense_date, supplier, batch_id, batches(batch_name)",
      { count: "exact" }
    )
    .order("expense_date", { ascending: false })
    .range(from, to);

  if (category) query = query.eq("category", category);
  if (supplier) query = query.ilike("supplier", `%${supplier}%`);
  if (batch) query = query.eq("batch_id", Number(batch));
  if (date_from) query = query.gte("expense_date", date_from);
  if (date_to) query = query.lte("expense_date", date_to);

  const { data: expenses, count, error } = await query;

  const safeExpenses = expenses ?? [];
  const totalCount = count ?? 0;

  const isFiltered = !!(category || supplier || batch || date_from || date_to);

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Финансовый учет</p>
          <h2 className="mt-1 text-3xl font-semibold">Расходы</h2>
        </div>

        <div className="flex gap-3">
          <ExportExpensesButton />
          <Link
            href="/expenses/new"
            className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
          >
            + Добавить расход
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Всего расходов" value={String(safeAll.length)} />
        <StatCard title="Общая сумма" value={`₸ ${total.toLocaleString("ru-RU")}`} />
        <StatCard title="Категорий" value={String(categories.length)} />
      </div>

      <div className="mt-6">
        <SectionCard title="История расходов" eyebrow="Расходы">
          {error ? (
            <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              Ошибка загрузки.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Текстовый поиск + дата + партия */}
              <ExpensesFilters
                batches={batches ?? []}
                supplier={supplier ?? ""}
                dateFrom={date_from ?? ""}
                dateTo={date_to ?? ""}
                batch={batch ?? ""}
              />

              {/* Фильтр по категории */}
              <div className="flex flex-wrap gap-2">
                {[{ label: "Все", cat: "" }, ...categories.map((c) => ({ label: c!, cat: c! }))].map(({ label, cat }) => {
                  const p = new URLSearchParams();
                  if (cat) p.set("category", cat);
                  if (supplier) p.set("supplier", supplier);
                  if (batch) p.set("batch", batch);
                  if (date_from) p.set("date_from", date_from);
                  if (date_to) p.set("date_to", date_to);
                  const qs = p.toString();
                  return (
                    <Link
                      key={cat || "all"}
                      href={`/expenses${qs ? `?${qs}` : ""}`}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        (category ?? "") === cat
                          ? "bg-[#1f4d3a] text-white"
                          : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-sm text-[#6b7280]">
                <span>Найдено: {totalCount}</span>
                {isFiltered && totalCount > 0 && (
                  <span className="font-medium text-[#1f4d3a]">
                    · ₸ {safeExpenses.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString("ru-RU")} на этой странице
                  </span>
                )}
              </div>

              {safeExpenses.length === 0 ? (
                <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                  {isFiltered ? "Нет расходов по выбранным фильтрам." : "Нет расходов."}
                </div>
              ) : (
                <div className="space-y-4">
                  {safeExpenses.map((item) => {
                    const batchName =
                      Array.isArray(item.batches)
                        ? item.batches[0]?.batch_name
                        : (item.batches as { batch_name: string } | null)?.batch_name;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold">{item.category}</p>
                            <p className="mt-1 text-sm text-[#6b7280]">
                              {batchName || "Без партии"}
                            </p>
                          </div>
                          <p className="font-semibold text-[#1f4d3a]">
                            ₸ {Number(item.amount).toLocaleString("ru-RU")}
                          </p>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="rounded-xl bg-[#f8faf7] p-3">
                            <p className="text-[#6b7280]">Дата</p>
                            <p className="mt-1 font-medium">{formatDate(item.expense_date)}</p>
                          </div>
                          <div className="rounded-xl bg-[#f8faf7] p-3">
                            <p className="text-[#6b7280]">Поставщик</p>
                            <p className="mt-1 font-medium">{item.supplier || "Не указан"}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end gap-2">
                          <Link
                            href={`/expenses/${item.id}/edit`}
                            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                          >
                            Изменить
                          </Link>
                          <DeleteButton
                            table="expenses"
                            id={item.id}
                            confirmMessage="Удалить эту запись расхода? Действие нельзя отменить."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Pagination page={page} totalCount={totalCount} pageSize={PAGE_SIZE} />
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
