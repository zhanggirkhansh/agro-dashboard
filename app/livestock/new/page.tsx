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

export default function NewLivestockPage() {
  const router = useRouter();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [form, setForm] = useState({
    animal_code: "",
    batch_id: "",
    age: "",
    start_weight: "",
    current_weight: "",
    status: "",
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

    const { error } = await supabase.from("livestock").insert([
      {
        animal_code: form.animal_code,
        batch_id: form.batch_id ? Number(form.batch_id) : null,
        batch: selectedBatch?.batch_name || null,
        age: form.age || null,
        start_weight: form.start_weight ? Number(form.start_weight) : null,
        current_weight: form.current_weight ? Number(form.current_weight) : null,
        status: form.status || null,
      },
    ]);

    if (error) {
      console.error(error);
      setError("Не удалось сохранить животное.");
      setLoading(false);
      return;
    }

    router.push("/livestock");
    router.refresh();
  }

  return (
    <section>
      <PageHeader
        eyebrow="Учет КРС"
        title="Добавить животное"
        actionLabel="Новая запись"
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Карточка животного" eyebrow="Форма ввода">
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
                    placeholder="Например: KRS-010"
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
                    disabled={loadingBatches}
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
                    <option value="Активный">Активный</option>
                    <option value="Набор массы">Набор массы</option>
                    <option value="Готовится к продаже">Готовится к продаже</option>
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
                    placeholder="Например: 220"
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
                    placeholder="Например: 285"
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
                  {loading ? "Сохранение..." : "Сохранить животное"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/livestock")}
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
                Теперь животное привязывается к реальной партии из базы.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Вес</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Вводи вес только числом, чтобы потом строить аналитику.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}