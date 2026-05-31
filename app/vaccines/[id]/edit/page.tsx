"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import { supabase } from "@/lib/supabase";
import { VACCINE_NAMES } from "@/constants/vaccines";
import { useToast } from "@/components/toast-provider";

const today = new Date().toISOString().split("T")[0];

export default function EditVaccinePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    vaccine_name: "",
    custom_vaccine: "",
    vaccination_date: "",
    next_vaccination_date: "",
    dose: "",
    veterinarian: "",
    vaccine_lot: "",
    comment: "",
  });

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("vaccines")
        .select("*, livestock(animal_code), batches(batch_name)")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Не удалось загрузить запись.");
        setFetching(false);
        return;
      }

      const animalCode = Array.isArray(data.livestock)
        ? data.livestock[0]?.animal_code
        : (data.livestock as { animal_code: string } | null)?.animal_code;
      const batchName = Array.isArray(data.batches)
        ? data.batches[0]?.batch_name
        : (data.batches as { batch_name: string } | null)?.batch_name;

      setSubject(animalCode || batchName || "");

      const isKnown = (VACCINE_NAMES as readonly string[]).includes(data.vaccine_name);
      setForm({
        vaccine_name: isKnown ? data.vaccine_name : "__custom__",
        custom_vaccine: isKnown ? "" : data.vaccine_name,
        vaccination_date: data.vaccination_date ?? "",
        next_vaccination_date: data.next_vaccination_date ?? "",
        dose: data.dose ?? "",
        veterinarian: data.veterinarian ?? "",
        vaccine_lot: data.vaccine_lot ?? "",
        comment: data.comment ?? "",
      });
      setFetching(false);
    }
    load();
  }, [id]);

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

    const { error } = await supabase
      .from("vaccines")
      .update({
        vaccine_name: vaccineName,
        vaccination_date: form.vaccination_date,
        next_vaccination_date: form.next_vaccination_date || null,
        dose: form.dose || null,
        veterinarian: form.veterinarian || null,
        vaccine_lot: form.vaccine_lot || null,
        comment: form.comment || null,
      })
      .eq("id", id);

    if (error) {
      setError("Не удалось сохранить изменения.");
      setLoading(false);
      return;
    }

    showToast("Запись обновлена", vaccineName, "success");
    router.push("/vaccines");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить эту запись о вакцинации? Действие нельзя отменить.")) return;
    setDeleting(true);

    const { error } = await supabase.from("vaccines").delete().eq("id", id);

    if (error) {
      setError("Не удалось удалить запись.");
      setDeleting(false);
      return;
    }

    router.push("/vaccines");
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
      <PageHeader
        eyebrow="Ветеринарный учёт"
        title={subject ? `Вакцинация: ${subject}` : "Редактировать запись"}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Карточка вакцинации" eyebrow="Редактирование">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <label className="mb-2 block text-sm font-medium">Следующая вакцинация</label>
                  <input
                    type="date"
                    name="next_vaccination_date"
                    value={form.next_vaccination_date}
                    onChange={handleChange}
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
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Серия вакцины</label>
                  <input
                    type="text"
                    name="vaccine_lot"
                    value={form.vaccine_lot}
                    onChange={handleChange}
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
                  onClick={() => router.push("/vaccines")}
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
              <p className="font-medium">Изменить животное нельзя</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Если ошиблись с животным — удалите запись и создайте новую.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
