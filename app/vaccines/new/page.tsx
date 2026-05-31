"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";
import { VACCINE_NAMES } from "@/constants/vaccines";
import { useToast } from "@/components/toast-provider";

type Animal = { id: number; animal_code: string; batch: string | null };
type Batch = { id: number; batch_name: string };

const today = new Date().toISOString().split("T")[0];

export default function NewVaccinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetAnimalId = searchParams.get("animal_id") ?? "";
  const { showToast } = useToast();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    target: "animal" as "animal" | "batch",
    animal_id: presetAnimalId,
    batch_id: "",
    vaccine_name: "",
    custom_vaccine: "",
    vaccination_date: today,
    next_vaccination_date: "",
    dose: "",
    veterinarian: "",
    vaccine_lot: "",
    comment: "",
  });

  useEffect(() => {
    async function load() {
      const [{ data: animalsData }, { data: batchesData }] = await Promise.all([
        supabase.from("livestock").select("id, animal_code, batch").order("animal_code"),
        supabase.from("batches").select("id, batch_name").order("created_at", { ascending: false }),
      ]);
      setAnimals(animalsData ?? []);
      setBatches(batchesData ?? []);
    }
    load();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const vaccineName = form.vaccine_name === "__custom__" ? form.custom_vaccine : form.vaccine_name;
    if (!vaccineName) {
      setError("Укажите название вакцины.");
      return;
    }
    setLoading(true);
    setError("");

    const animalId = form.target === "animal" && form.animal_id ? Number(form.animal_id) : null;
    const batchId = form.target === "batch" && form.batch_id ? Number(form.batch_id) : null;

    const { error } = await supabase.from("vaccines").insert([{
      animal_id: animalId,
      batch_id: batchId,
      vaccine_name: vaccineName,
      vaccination_date: form.vaccination_date,
      next_vaccination_date: form.next_vaccination_date || null,
      dose: form.dose || null,
      veterinarian: form.veterinarian || null,
      vaccine_lot: form.vaccine_lot || null,
      comment: form.comment || null,
    }]);

    if (error) {
      setError("Не удалось сохранить запись.");
      setLoading(false);
      return;
    }

    showToast("Вакцинация записана", vaccineName, "success");
    router.push("/vaccines");
    router.refresh();
  }

  return (
    <section>
      <PageHeader eyebrow="Ветеринарный учёт" title="Добавить вакцинацию" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Карточка вакцинации" eyebrow="Форма ввода">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Животное или партия */}
              <div>
                <label className="mb-2 block text-sm font-medium">Кого вакцинировали</label>
                <div className="mb-3 flex gap-3">
                  {(["animal", "batch"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, target: t }))}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        form.target === t
                          ? "bg-[#1f4d3a] text-white"
                          : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf]"
                      }`}
                    >
                      {t === "animal" ? "Конкретное животное" : "Вся партия"}
                    </button>
                  ))}
                </div>

                {form.target === "animal" ? (
                  <select
                    name="animal_id"
                    value={form.animal_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите животное</option>
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.animal_code}{a.batch ? ` · ${a.batch}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    name="batch_id"
                    value={form.batch_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите партию</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.batch_name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Вакцина */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Вакцина</label>
                  <select
                    name="vaccine_name"
                    value={form.vaccine_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Выберите вакцину</option>
                    {VACCINE_NAMES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                    <option value="__custom__">Другая (ввести вручную)</option>
                  </select>
                  {form.vaccine_name === "__custom__" && (
                    <input
                      type="text"
                      name="custom_vaccine"
                      value={form.custom_vaccine}
                      onChange={handleChange}
                      placeholder="Название вакцины"
                      required
                      className="mt-2 w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Дата вакцинации</label>
                  <input
                    type="date"
                    name="vaccination_date"
                    value={form.vaccination_date}
                    onChange={handleChange}
                    max={today}
                    required
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Дата следующей вакцинации
                  </label>
                  <input
                    type="date"
                    name="next_vaccination_date"
                    value={form.next_vaccination_date}
                    onChange={handleChange}
                    min={today}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Доза</label>
                  <input
                    type="text"
                    name="dose"
                    value={form.dose}
                    onChange={handleChange}
                    placeholder="Например: 2 мл"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Ветеринар</label>
                  <input
                    type="text"
                    name="veterinarian"
                    value={form.veterinarian}
                    onChange={handleChange}
                    placeholder="ФИО ветеринара"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Серия вакцины</label>
                  <input
                    type="text"
                    name="vaccine_lot"
                    value={form.vaccine_lot}
                    onChange={handleChange}
                    placeholder="Например: АВС-2025-001"
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Комментарий</label>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Например: реакция на вакцину, условия хранения..."
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
                  {loading ? "Сохранение..." : "Сохранить запись"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/vaccines")}
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
              <p className="font-medium">Партия или животное</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Если вакцинировали всю партию — выбери «Вся партия». Для одного животного — «Конкретное животное».
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Следующая дата</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Укажи дату ревакцинации — система напомнит за 30 дней и пометит как просроченную если прошла.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Серия вакцины</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Нужна для ветеринарных документов и актов.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
