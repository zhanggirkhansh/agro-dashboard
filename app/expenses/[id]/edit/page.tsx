"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/toast-provider";

type Batch = { id: number; batch_name: string };

const CATEGORIES = ["Корм", "Транспорт", "Лечение", "Зарплата", "Прочее"];
const today = new Date().toISOString().split("T")[0];

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { showToast } = useToast();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    date: "",
    batch_id: "",
    supplier: "",
    comment: "",
  });

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: expense, error: expErr }, { data: batchesData }] =
        await Promise.all([
          supabase.from("expenses").select("*").eq("id", id).single(),
          supabase.from("batches").select("id, batch_name").order("created_at", { ascending: false }),
        ]);

      if (expErr || !expense) {
        setError("Не удалось загрузить расход.");
        setFetching(false);
        return;
      }

      setBatches(batchesData ?? []);
      setForm({
        category: expense.category ?? "",
        amount: expense.amount != null ? String(expense.amount) : "",
        date: expense.expense_date ?? "",
        batch_id: expense.batch_id != null ? String(expense.batch_id) : "",
        supplier: expense.supplier ?? "",
        comment: expense.comment ?? "",
      });
      setFetching(false);
    }
    load();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (Number(form.amount) <= 0) {
      setError("Сумма должна быть больше нуля.");
      return;
    }
    setLoading(true);
    setError("");

    const selectedBatch = batches.find((b) => String(b.id) === form.batch_id);

    const { error } = await supabase
      .from("expenses")
      .update({
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.date,
        batch_id: form.batch_id ? Number(form.batch_id) : null,
        batch: selectedBatch?.batch_name ?? null,
        supplier: form.supplier || null,
        comment: form.comment || null,
      })
      .eq("id", id);

    if (error) {
      setError("Не удалось сохранить изменения.");
      setLoading(false);
      return;
    }

    showToast("Расход обновлён", form.category, "success");
    router.push("/expenses");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить эту запись расхода? Действие нельзя отменить.")) return;
    setDeleting(true);

    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      setError("Не удалось удалить запись.");
      setDeleting(false);
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  if (fetching) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm text-[#6b7280] shadow-sm ring-1 ring-[#e6ebdf]">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <section>
      <PageHeader eyebrow="Финансовый учет" title="Редактировать расход" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Запись расхода" eyebrow="Редактирование">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Категория</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите категорию</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Сумма</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Дата</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    max={today}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Партия</label>
                  <select
                    name="batch_id"
                    value={form.batch_id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Без партии</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.batch_name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Поставщик</label>
                  <input
                    type="text"
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Комментарий</label>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/expenses")}
                  className="rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                >
                  Отмена
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-2xl bg-[#fef2f2] px-5 py-3 font-medium text-[#b91c1c] ring-1 ring-[#fecaca] hover:bg-[#fee2e2] disabled:opacity-60 sm:ml-auto"
                >
                  {deleting ? "Удаление..." : "Удалить"}
                </button>
              </div>

              {error && (
                <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                  {error}
                </div>
              )}
            </form>
          </SectionCard>
        </div>

        <SectionCard title="Подсказки" eyebrow="Что важно">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Удаление</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Если этот расход был создан автоматически при добавлении корма — удали его там же.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
