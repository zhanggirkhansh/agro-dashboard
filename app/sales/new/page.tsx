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
  const [form, setForm] = useState({
    animal_id: "",
    sale_date: "",
    price_per_kg: "",
  });

  const [total, setTotal] = useState(0);
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
    setError("");

    const animal = selectedAnimal;
    if (!animal) {
      setError("Выбери животное.");
      return;
    }

    if (!form.sale_date) {
      setError("Укажи дату продажи.");
      return;
    }

    if (!form.price_per_kg) {
      setError("Укажи цену за кг.");
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
      return;
    }

    const { error: updateError } = await supabase
      .from("livestock")
      .update({ status: "Продан" })
      .eq("id", animal.id);

    if (updateError) {
      console.error(updateError);
      setError("Продажа сохранена, но статус животного не обновился.");
      return;
    }

    router.push("/sales");
    router.refresh();
  }

  return (
    <section>
      <PageHeader eyebrow="Продажи" title="Продажа животного" />

      <SectionCard title="Оформление продажи">
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="animal_id"
            value={form.animal_id}
            onChange={handleChange}
            className="w-full rounded-2xl border p-3"
            required
          >
            <option value="">Выбери животное</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.animal_code}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="sale_date"
            value={form.sale_date}
            onChange={handleChange}
            className="w-full rounded-2xl border p-3"
            required
          />

          <input
            type="number"
            name="price_per_kg"
            value={form.price_per_kg}
            placeholder="Цена за кг"
            onChange={handleChange}
            className="w-full rounded-2xl border p-3"
            required
          />

          <div className="text-lg font-semibold">
            Сумма: ₸ {total.toLocaleString("ru-RU")}
          </div>

          <button className="rounded-2xl bg-green-800 px-4 py-3 text-white">
            Продать
          </button>

          {error && (
            <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              {error}
            </div>
          )}
        </form>
      </SectionCard>
    </section>
  );
}