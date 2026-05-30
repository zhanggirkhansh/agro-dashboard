"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";
import { BATCH_STATUS, BATCH_STATUSES } from "@/constants/status";
import { useToast } from "@/components/toast-provider";

export default function EditBatchPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const id = Number(params.id);

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
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Не удалось загрузить партию.");
        setFetching(false);
        return;
      }

      setForm({
        batch_name: data.batch_name ?? "",
        heads: data.heads != null ? String(data.heads) : "",
        start_weight: data.start_weight != null ? String(data.start_weight) : "",
        current_weight: data.current_weight != null ? String(data.current_weight) : "",
        expenses: data.expenses != null ? String(data.expenses) : "",
        forecast_profit: data.forecast_profit != null ? String(data.forecast_profit) : "",
        status: data.status ?? "",
      });

      setFetching(false);
    }

    load();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("batches")
      .update({
        batch_name: form.batch_name,
        heads: form.heads ? Number(form.heads) : null,
        start_weight: form.start_weight ? Number(form.start_weight) : null,
        current_weight: form.current_weight ? Number(form.current_weight) : null,
        expenses: form.expenses ? Number(form.expenses) : null,
        forecast_profit: form.forecast_profit ? Number(form.forecast_profit) : null,
        status: form.status || null,
      })
      .eq("id", id);

    if (error) {
      setError("Не удалось сохранить изменения.");
      setLoading(false);
      return;
    }

    if (form.status === BATCH_STATUS.READY_FOR_SALE) {
      showToast(
        "Партия готова к продаже",
        `«${form.batch_name}» переведена в статус «Готовится к продаже»`,
        "warning"
      );
    } else {
      showToast("Изменения сохранены", form.batch_name, "success");
    }

    router.push("/batches");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Удалить партию «${form.batch_name}»? Это действие нельзя отменить.`)) return;

    setDeleting(true);

    const { error } = await supabase.from("batches").delete().eq("id", id);

    if (error) {
      setError("Не удалось удалить партию.");
      setDeleting(false);
      return;
    }

    router.push("/batches");
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
      <PageHeader eyebrow="Управление откормом" title="Редактировать партию" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Карточка партии" eyebrow="Редактирование">
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
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Расходы</label>
                  <input
                    type="number"
                    name="expenses"
                    value={form.expenses}
                    onChange={handleChange}
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
                    {BATCH_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
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
                  {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/batches")}
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
                  {deleting ? "Удаление..." : "Удалить партию"}
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
              <p className="font-medium">Удаление партии</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                При удалении партии животные, привязанные к ней, не удаляются — только запись партии.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Статус</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Меняй статус по мере прогресса откорма.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
