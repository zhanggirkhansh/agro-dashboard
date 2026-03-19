"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";

type Batch = {
  id: number;
  batch_name: string;
};

export default function NewExpensePage() {
  const router = useRouter();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [form, setForm] = useState({
    category: "",
    amount: "",
    date: "",
    batch_id: "",
    supplier: "",
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBatches() {
      const { data, error } = await supabase
        .from("batches")
        .select("id, batch_name")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setBatches(data || []);
      }

      setLoadingBatches(false);
    }

    loadBatches();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const selectedBatch = batches.find(
      (item) => String(item.id) === form.batch_id
    );

    const { error } = await supabase.from("expenses").insert([
      {
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.date,
        batch_id: form.batch_id ? Number(form.batch_id) : null,
        batch: selectedBatch?.batch_name || null,
        supplier: form.supplier || null,
        comment: form.comment || null,
      },
    ]);

    if (error) {
      console.error(error);
      setError("Не удалось сохранить расход.");
      setLoading(false);
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  return (
    <section>
      <PageHeader
        eyebrow="Финансовый учет"
        title="Добавить расход"
        actionLabel="Новый расход"
      />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <SectionCard title="Новая запись расхода" eyebrow="Форма ввода">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Категория
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите категорию</option>
                    <option value="Корм">Корм</option>
                    <option value="Транспорт">Транспорт</option>
                    <option value="Лечение">Лечение</option>
                    <option value="Зарплата">Зарплата</option>
                    <option value="Прочее">Прочее</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Сумма</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Например: 85000"
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
                    disabled={loadingBatches}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">
                      {loadingBatches ? "Загрузка партий..." : "Выберите партию"}
                    </option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Поставщик / кому оплачено
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    placeholder="Например: ИП Амангелды"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Комментарий
                  </label>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    placeholder="Например: покупка ячменя на 3 дня"
                    rows={5}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Сохранение..." : "Сохранить расход"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/expenses")}
                  className="rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                >
                  Отмена
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
              <p className="font-medium">Связь с партией</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Теперь расход привязывается к реальной партии через batch_id.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Сумма</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Вводи только число без символа тенге.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}