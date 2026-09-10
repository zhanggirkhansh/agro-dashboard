"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/toast-provider";

const today = new Date().toISOString().split("T")[0];

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { showToast } = useToast();

  const [animalCode, setAnimalCode] = useState("");
  const [form, setForm] = useState({
    sale_date: "",
    weight: "",
    price_per_kg: "",
  });

  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("sales")
        .select("*, livestock(animal_code)")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Не удалось загрузить запись продажи.");
        setFetching(false);
        return;
      }

      const code = Array.isArray(data.livestock)
        ? data.livestock[0]?.animal_code
        : (data.livestock as { animal_code: string } | null)?.animal_code;

      setAnimalCode(code ?? "");
      setForm({
        sale_date: data.sale_date ?? "",
        weight: data.weight != null ? String(data.weight) : "",
        price_per_kg: data.price_per_kg != null ? String(data.price_per_kg) : "",
      });
      setFetching(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    const w = Number(form.weight);
    const p = Number(form.price_per_kg);
    setTotal(w > 0 && p > 0 ? w * p : 0);
  }, [form.weight, form.price_per_kg]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const w = Number(form.weight);
    const p = Number(form.price_per_kg);

    if (w <= 0) { setError("Вес должен быть больше нуля."); return; }
    if (p <= 0) { setError("Цена за кг должна быть больше нуля."); return; }

    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("sales")
      .update({
        sale_date: form.sale_date,
        weight: w,
        price_per_kg: p,
        total_amount: w * p,
      })
      .eq("id", id);

    if (error) {
      setError("Не удалось сохранить изменения.");
      setLoading(false);
      return;
    }

    showToast("Продажа обновлена", animalCode, "success");
    router.push("/sales");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить эту продажу? Действие нельзя отменить.")) return;
    setDeleting(true);

    const { error } = await supabase.from("sales").delete().eq("id", id);

    if (error) {
      setError("Не удалось удалить запись.");
      setDeleting(false);
      return;
    }

    router.push("/sales");
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
      <PageHeader eyebrow="Продажи" title="Редактировать продажу" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title={animalCode ? `Продажа: ${animalCode}` : "Редактирование"}
            eyebrow="Форма"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Дата продажи</label>
                  <input
                    type="date"
                    name="sale_date"
                    value={form.sale_date}
                    onChange={handleChange}
                    max={today}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Вес (кг)</label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Цена за кг (₸)</label>
                  <input
                    type="number"
                    name="price_per_kg"
                    value={form.price_per_kg}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="rounded-2xl bg-[#f8faf7] p-4">
                    <p className="text-sm text-[#6b7280]">Итоговая сумма</p>
                    <p className="mt-1 text-2xl font-semibold text-[#1f4d3a]">
                      ₸ {total.toLocaleString("ru-RU")}
                    </p>
                  </div>
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
                  onClick={() => router.push("/sales")}
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
              <p className="font-medium">Сумма пересчитается</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                При изменении веса или цены итоговая сумма обновится автоматически.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Животное</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Изменить привязку к животному нельзя — только финансовые данные.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
