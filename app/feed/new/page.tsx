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

export default function NewFeedPage() {
  const router = useRouter();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [form, setForm] = useState({
    feed_name: "",
    quantity: "",
    unit: "кг",
    feed_date: "",
    cost: "",
    batch_id: "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    const batchId = form.batch_id ? Number(form.batch_id) : null;
    const costValue = form.cost ? Number(form.cost) : null;
    const quantityValue = Number(form.quantity);

    const { error: feedError } = await supabase.from("feed").insert([
      {
        feed_name: form.feed_name,
        quantity: quantityValue,
        unit: form.unit,
        feed_date: form.feed_date,
        cost: costValue,
        batch_id: batchId,
      },
    ]);

    if (feedError) {
      console.error(feedError);
      setError("Не удалось сохранить запись по корму.");
      setLoading(false);
      return;
    }

    if (costValue && costValue > 0) {
      const { error: expenseError } = await supabase.from("expenses").insert([
        {
          category: "Корм",
          amount: costValue,
          expense_date: form.feed_date,
          batch_id: batchId,
          batch: selectedBatch?.batch_name || null,
          supplier: null,
          comment: `Корм: ${form.feed_name}, ${quantityValue} ${form.unit}`,
        },
      ]);

      if (expenseError) {
        console.error(expenseError);
        setError(
          "Корм сохранён, но не удалось автоматически добавить расход."
        );
        setLoading(false);
        return;
      }
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <section>
      <PageHeader
        eyebrow="Учет кормов"
        title="Добавить корм"
        actionLabel="Новая запись"
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Запись по корму" eyebrow="Форма ввода">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Название корма
                  </label>
                  <select
                    name="feed_name"
                    value={form.feed_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите корм</option>
                    <option value="Ячмень">Ячмень</option>
                    <option value="Сено">Сено</option>
                    <option value="Соль">Соль</option>
                    <option value="Пшеница">Пшеница</option>
                    <option value="Комбикорм">Комбикорм</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Количество
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="Например: 250"
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Единица
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="кг">кг</option>
                    <option value="т">т</option>
                    <option value="мешок">мешок</option>
                    <option value="рулон">рулон</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Дата</label>
                  <input
                    type="date"
                    name="feed_date"
                    value={form.feed_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Стоимость
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    placeholder="Например: 45000"
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
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Сохранение..." : "Сохранить запись"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/feed")}
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
              <p className="font-medium">Авторасход</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Если указана стоимость, запись по корму автоматически попадет и
                в расходы.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Без дублей</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Такой расход вручную в разделе «Расходы» повторно добавлять не
                нужно.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}