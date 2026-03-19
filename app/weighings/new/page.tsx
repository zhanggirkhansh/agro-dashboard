"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";

type Animal = {
  id: number;
  animal_code: string;
  current_weight: number | null;
  batch: string | null;
};

export default function NewWeighingPage() {
  const router = useRouter();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  const [form, setForm] = useState({
    animal_id: "",
    weighing_date: "",
    weight: "",
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnimals() {
      const { data, error } = await supabase
        .from("livestock")
        .select("id, animal_code, current_weight, batch")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setAnimals(data || []);
      }

      setLoadingAnimals(false);
    }

    loadAnimals();
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

    const animalId = Number(form.animal_id);
    const newWeight = Number(form.weight);

    const { error: insertError } = await supabase.from("weighings").insert([
      {
        animal_id: animalId,
        weighing_date: form.weighing_date,
        weight: newWeight,
        comment: form.comment || null,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      setError("Не удалось сохранить взвешивание.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("livestock")
      .update({ current_weight: newWeight })
      .eq("id", animalId);

    if (updateError) {
      console.error(updateError);
      setError("Взвешивание сохранено, но не удалось обновить текущий вес животного.");
      setLoading(false);
      return;
    }

    router.push("/weighings");
    router.refresh();
  }

  const selectedAnimal = animals.find(
    (animal) => String(animal.id) === form.animal_id
  );

  return (
    <section>
      <PageHeader
        eyebrow="Контроль привеса"
        title="Добавить взвешивание"
        actionLabel="Новый замер"
      />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <SectionCard title="Форма взвешивания" eyebrow="Новая запись">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Животное
                  </label>
                  <select
                    name="animal_id"
                    value={form.animal_id}
                    onChange={handleChange}
                    required
                    disabled={loadingAnimals}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">
                      {loadingAnimals
                        ? "Загрузка животных..."
                        : "Выберите животное"}
                    </option>
                    {animals.map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.animal_code}
                        {animal.batch ? ` · ${animal.batch}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Дата</label>
                  <input
                    type="date"
                    name="weighing_date"
                    value={form.weighing_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Вес</label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="Например: 302"
                    required
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
                    placeholder="Например: контрольное взвешивание после смены рациона"
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
                  {loading ? "Сохранение..." : "Сохранить взвешивание"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/weighings")}
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

        <SectionCard title="Быстрый обзор" eyebrow="Подсказки">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Последний вес</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {selectedAnimal?.current_weight != null
                  ? `${selectedAnimal.current_weight} кг`
                  : "Выбери животное, чтобы увидеть текущий вес."}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Обновление системы</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                После нового взвешивания текущий вес в карточке животного обновится автоматически.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}