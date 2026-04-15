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
  batch_id: number | null;
};

export default function NewSalePage() {
  const router = useRouter();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  const [form, setForm] = useState({
    animal_id: "",
    sale_date: "",
    price_per_kg: "",
  });

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnimals() {
      const { data, error } = await supabase
        .from("livestock")
        .select("id, animal_code, current_weight, batch_id")
        .neq("status", "Продан");

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  const selectedAnimal = animals.find(
    (a) => String(a.id) === form.animal_id
  );

  useEffect(() => {
    if (selectedAnimal && form.price_per_kg) {
      const t =
        Number(selectedAnimal.current_weight || 0) *
        Number(form.price_per_kg);
      setTotal(t);
    } else {
      setTotal(0);
    }
  }, [selectedAnimal, form.price_per_kg]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const animal = selectedAnimal;
    if (!animal) {
      setError("Выбери животное.");
      setLoading(false);
      return;
    }

    if (!form.sale_date) {
      setError("Укажи дату продажи.");
      setLoading(false);
      return;
    }

    if (!form.price_per_kg) {
      setError("Укажи цену за кг.");
      setLoading(false);
      return;
    }

    const totalAmount =
      Number(animal.current_weight || 0) * Number(form.price_per_kg);

    const { error: insertError } = await supabase.from("sales").insert([
      {
        animal_id: animal.id,
        batch_id: animal.batch_id,
        sale_date: form.sale_date,
        weight: animal.current_weight,
        price_per_kg: Number(form.price_per_kg),
        total_amount: totalAmount,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      setError("Не удалось сохранить продажу.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("livestock")
      .update({ status: "Продан" })
      .eq("id", animal.id);

    if (updateError) {
      console.error(updateError);
      setError("Продажа сохранена, но статус животного не обновился.");
      setLoading(false);
      return;
    }

    router.push("/sales");
    router.refresh();
  }

  return (
    <section>
      <PageHeader
        eyebrow="Продажи"
        title="Продажа животного"
        actionLabel="Новая продажа"
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Оформление продажи" eyebrow="Форма ввода">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Животное
                  </label>
                  <select
                    name="animal_id"
                    value={form.animal_id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                    required
                    disabled={loadingAnimals}
                  >
                    <option value="">
                      {loadingAnimals
                        ? "Загрузка животных..."
                        : "Выбери животное"}
                    </option>
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.animal_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Дата продажи
                  </label>
                  <input
                    type="date"
                    name="sale_date"
                    value={form.sale_date}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Цена за кг
                  </label>
                  <input
                    type="number"
                    name="price_per_kg"
                    value={form.price_per_kg}
                    placeholder="Например: 1800"
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-sm text-[#6b7280]">Итоговая сумма</p>
                <p className="mt-1 text-2xl font-semibold text-[#1f4d3a]">
                  ₸ {total.toLocaleString("ru-RU")}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Сохранение..." : "Продать"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/sales")}
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
              <p className="font-medium">Текущий вес</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {selectedAnimal?.current_weight != null
                  ? `${selectedAnimal.current_weight} кг`
                  : "Выбери животное, чтобы увидеть его текущий вес."}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Статус животного</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                После продажи животное автоматически получит статус «Продан».
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}