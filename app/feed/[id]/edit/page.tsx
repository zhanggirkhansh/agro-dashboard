"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/toast-provider";

type Batch = { id: number; batch_name: string };

const today = new Date().toISOString().split("T")[0];

export default function EditFeedPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { showToast } = useToast();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({
    feed_name: "",
    quantity: "",
    unit: "кг",
    feed_date: "",
    cost: "",
    batch_id: "",
  });

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: feed, error: feedErr }, { data: batchesData }] =
        await Promise.all([
          supabase.from("feed").select("*").eq("id", id).single(),
          supabase.from("batches").select("id, batch_name").order("created_at", { ascending: false }),
        ]);

      if (feedErr || !feed) {
        setError("Не удалось загрузить запись.");
        setFetching(false);
        return;
      }

      setBatches(batchesData ?? []);
      setForm({
        feed_name: feed.feed_name ?? "",
        quantity: feed.quantity != null ? String(feed.quantity) : "",
        unit: feed.unit ?? "кг",
        feed_date: feed.feed_date ?? "",
        cost: feed.cost != null ? String(feed.cost) : "",
        batch_id: feed.batch_id != null ? String(feed.batch_id) : "",
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
    if (Number(form.quantity) <= 0) {
      setError("Количество должно быть больше нуля.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("feed")
      .update({
        feed_name: form.feed_name,
        quantity: Number(form.quantity),
        unit: form.unit,
        feed_date: form.feed_date,
        cost: form.cost ? Number(form.cost) : null,
        batch_id: form.batch_id ? Number(form.batch_id) : null,
      })
      .eq("id", id);

    if (error) {
      setError("Не удалось сохранить изменения.");
      setLoading(false);
      return;
    }

    showToast("Запись по корму обновлена", form.feed_name, "success");
    router.push("/feed");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить эту запись по корму? Действие нельзя отменить.")) return;
    setDeleting(true);

    const { error } = await supabase.from("feed").delete().eq("id", id);

    if (error) {
      setError("Не удалось удалить запись.");
      setDeleting(false);
      return;
    }

    router.push("/feed");
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
      <PageHeader eyebrow="Учет кормов" title="Редактировать запись" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Запись по корму" eyebrow="Редактирование">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Название корма</label>
                  <select
                    name="feed_name"
                    value={form.feed_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите корм</option>
                    {["Ячмень","Сено","Соль","Пшеница","Комбикорм"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Количество</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Единица</label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    {["кг","т","мешок","рулон"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Дата</label>
                  <input
                    type="date"
                    name="feed_date"
                    value={form.feed_date}
                    onChange={handleChange}
                    max={today}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Стоимость</label>
                  <input
                    type="number"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    min="0"
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
                  onClick={() => router.push("/feed")}
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
              <p className="font-medium">Стоимость</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Изменение стоимости здесь не обновит связанный расход — при необходимости отредактируй его в разделе «Расходы».
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
