"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";
import { LIVESTOCK_STATUSES } from "@/constants/status";

type Batch = {
  id: number;
  batch_name: string;
};

export default function EditLivestockPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({
    animal_code: "",
    batch_id: "",
    age: "",
    start_weight: "",
    current_weight: "",
    status: "",
  });

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: animal, error: animalError }, { data: batchesData }] =
        await Promise.all([
          supabase.from("livestock").select("*").eq("id", id).single(),
          supabase
            .from("batches")
            .select("id, batch_name")
            .order("created_at", { ascending: false }),
        ]);

      if (animalError || !animal) {
        setError("Не удалось загрузить животное.");
        setFetching(false);
        return;
      }

      setBatches(batchesData ?? []);
      setForm({
        animal_code: animal.animal_code ?? "",
        batch_id: animal.batch_id != null ? String(animal.batch_id) : "",
        age: animal.age ?? "",
        start_weight: animal.start_weight != null ? String(animal.start_weight) : "",
        current_weight: animal.current_weight != null ? String(animal.current_weight) : "",
        status: animal.status ?? "",
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

    const selectedBatch = batches.find((b) => String(b.id) === form.batch_id);

    const { error } = await supabase
      .from("livestock")
      .update({
        animal_code: form.animal_code,
        batch_id: form.batch_id ? Number(form.batch_id) : null,
        batch: selectedBatch?.batch_name ?? null,
        age: form.age || null,
        start_weight: form.start_weight ? Number(form.start_weight) : null,
        current_weight: form.current_weight ? Number(form.current_weight) : null,
        status: form.status || null,
      })
      .eq("id", id);

    if (error) {
      setError("Не удалось сохранить изменения.");
      setLoading(false);
      return;
    }

    router.push(`/livestock/${id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (
      !confirm(
        `Удалить животное «${form.animal_code || id}»? Это действие нельзя отменить.`
      )
    )
      return;

    setDeleting(true);

    const { error } = await supabase.from("livestock").delete().eq("id", id);

    if (error) {
      setError("Не удалось удалить животное.");
      setDeleting(false);
      return;
    }

    router.push("/livestock");
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
      <PageHeader eyebrow="Учет КРС" title="Редактировать животное" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Карточка животного" eyebrow="Редактирование">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Код животного
                  </label>
                  <input
                    type="text"
                    name="animal_code"
                    value={form.animal_code}
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
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Без партии</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Возраст</label>
                  <input
                    type="text"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Например: 14 мес."
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Статус</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите статус</option>
                    {LIVESTOCK_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Стартовый вес
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
                    Текущий вес
                  </label>
                  <input
                    type="number"
                    name="current_weight"
                    value={form.current_weight}
                    onChange={handleChange}
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
                  onClick={() => router.push(`/livestock/${id}`)}
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
                  {deleting ? "Удаление..." : "Удалить животное"}
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
              <p className="font-medium">Смена партии</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                При смене партии обновляется и поле batch_id, и текстовое название партии.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Удаление</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                При удалении животного его взвешивания остаются в базе.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
