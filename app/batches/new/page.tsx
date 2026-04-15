"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";

export default function NewBatchPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    batch_name: "",
    heads: "",
    start_weight: "",
    current_weight: "",
    expenses: "",
    forecast_profit: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const { error } = await supabase.from("batches").insert([
      {
        batch_name: form.batch_name,
        heads: form.heads ? Number(form.heads) : null,
        start_weight: form.start_weight ? Number(form.start_weight) : null,
        current_weight: form.current_weight ? Number(form.current_weight) : null,
        expenses: form.expenses ? Number(form.expenses) : null,
        forecast_profit: form.forecast_profit
          ? Number(form.forecast_profit)
          : null,
        status: form.status || null,
      },
    ]);

    if (error) {
      console.error(error);
      setError("Не удалось сохранить партию.");
      setLoading(false);
      return;
    }

    router.push("/batches");
    router.refresh();
  }

  return (
    <section>
      <PageHeader
        eyebrow="Управление откормом"
        title="Создать партию"
        actionLabel="Новая партия"
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Карточка партии" eyebrow="Форма ввода">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Название партии
                  </label>
                  <input
                    type="text"
                    name="batch_name"
                    value={form.batch_name}
                    onChange={handleChange}
                    placeholder="Например: Партия №6"
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Количество голов
                  </label>
                  <input
                    type="number"
                    name="heads"
                    value={form.heads}
                    onChange={handleChange}
                    placeholder="Например: 45"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Средний стартовый вес
                  </label>
                  <input
                    type="number"
                    name="start_weight"
                    value={form.start_weight}
                    onChange={handleChange}
                    placeholder="Например: 220"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Текущий средний вес
                  </label>
                  <input
                    type="number"
                    name="current_weight"
                    value={form.current_weight}
                    onChange={handleChange}
                    placeholder="Например: 285"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Расходы
                  </label>
                  <input
                    type="number"
                    name="expenses"
                    value={form.expenses}
                    onChange={handleChange}
                    placeholder="Например: 1200000"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Прогноз прибыли
                  </label>
                  <input
                    type="number"
                    name="forecast_profit"
                    value={form.forecast_profit}
                    onChange={handleChange}
                    placeholder="Например: 540000"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Статус</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите статус</option>
                    <option value="Активный">Активный</option>
                    <option value="Набор массы">Набор массы</option>
                    <option value="Готовится к продаже">Готовится к продаже</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Сохранение..." : "Сохранить партию"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/batches")}
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
              <p className="font-medium">Название партии</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Используй понятные названия: Партия №6, Партия весна 2026 и т.д.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Средний вес</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Вводи средние значения по партии, чтобы потом считать аналитику.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}