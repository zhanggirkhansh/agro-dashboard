"use client";

import { useEffect, useState } from "react";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import UserManagementSection from "@/components/user-management-section";
import InviteUserSection from "@/components/invite-user-section";
import { LIVESTOCK_STATUSES } from "@/constants/status";
import { useToast } from "@/components/toast-provider";

const STORAGE_KEY = "westkazagro_settings";

type Settings = {
  farmName: string;
  currency: string;
  weightUnit: string;
  feedUnit: string;
};

const defaults: Settings = {
  farmName: "WestKaz Agro",
  currency: "KZT (₸)",
  weightUnit: "кг",
  feedUnit: "кг",
};

const expenseCategories = ["Корм", "Транспорт", "Лечение", "Зарплата", "Прочее"];
const feedTypes = ["Ячмень", "Сено", "Соль", "Пшеница", "Комбикорм"];
const animalStatuses = LIVESTOCK_STATUSES;

export default function SettingsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setForm({ ...defaults, ...JSON.parse(stored) });
    } catch {}
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      setSaved(true);
      showToast("Настройки сохранены", form.farmName, "success");
    } catch {
      showToast("Не удалось сохранить", "Ошибка localStorage", "warning");
    }
  }

  const stats = [
    { title: "Хозяйство", value: form.farmName },
    { title: "Валюта", value: form.currency },
    { title: "Ед. веса", value: form.weightUnit },
    { title: "Ед. корма", value: form.feedUnit },
  ];

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Системные параметры</p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Настройки</h2>
        </div>
        <button
          form="settings-form"
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90 sm:w-auto"
        >
          {saved ? "Сохранено ✓" : "Сохранить изменения"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <form id="settings-form" onSubmit={handleSave}>
            <SectionCard title="Основные параметры" eyebrow="Общие настройки">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Название хозяйства
                  </label>
                  <input
                    type="text"
                    name="farmName"
                    value={form.farmName}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none focus:border-[#1f4d3a] dark:border-[#1e3326] dark:bg-[#0d1810] dark:text-[#ddeadf]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Валюта</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none focus:border-[#1f4d3a] dark:border-[#1e3326] dark:bg-[#0d1810] dark:text-[#ddeadf]"
                  >
                    <option>KZT (₸)</option>
                    <option>RUB (₽)</option>
                    <option>USD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Базовая единица веса
                  </label>
                  <select
                    name="weightUnit"
                    value={form.weightUnit}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none focus:border-[#1f4d3a] dark:border-[#1e3326] dark:bg-[#0d1810] dark:text-[#ddeadf]"
                  >
                    <option>кг</option>
                    <option>т</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Формат учета кормов
                  </label>
                  <select
                    name="feedUnit"
                    value={form.feedUnit}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none focus:border-[#1f4d3a] dark:border-[#1e3326] dark:bg-[#0d1810] dark:text-[#ddeadf]"
                  >
                    <option>кг</option>
                    <option>т</option>
                    <option>рулон</option>
                    <option>мешок</option>
                  </select>
                </div>
              </div>
            </SectionCard>
          </form>

          <SectionCard title="Категории расходов" eyebrow="Финансовая структура">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {expenseCategories.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] px-4 py-3 dark:border-[#1e3326] dark:bg-[#0f1e14]"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Типы кормов" eyebrow="Кормовая база">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {feedTypes.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] px-4 py-3 dark:border-[#1e3326] dark:bg-[#0f1e14]"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Статусы животных" eyebrow="Логика учета">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {animalStatuses.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] px-4 py-3 dark:border-[#1e3326] dark:bg-[#0f1e14]"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Краткий обзор" eyebrow="Что здесь можно менять">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#f8faf7] p-4 dark:bg-[#0f1e14]">
                <p className="font-medium">Хозяйство</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Название и базовые системные параметры.
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8faf7] p-4 dark:bg-[#0f1e14]">
                <p className="font-medium">Категории</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Финансовые и кормовые справочники.
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8faf7] p-4 dark:bg-[#0f1e14]">
                <p className="font-medium">Статусы</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Состояния животных для учета и аналитики.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Роли" eyebrow="Описание доступа">
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#f8faf7] p-4 dark:bg-[#0f1e14]">
                <p className="font-medium">Директор (admin)</p>
                <p className="mt-1 text-sm text-[#6b7280]">Полный доступ ко всем разделам.</p>
              </div>
              <div className="rounded-2xl bg-[#f8faf7] p-4 dark:bg-[#0f1e14]">
                <p className="font-medium">Зоотехник (zoologist)</p>
                <p className="mt-1 text-sm text-[#6b7280]">Поголовье, партии, взвешивания, вакцины.</p>
              </div>
              <div className="rounded-2xl bg-[#f8faf7] p-4 dark:bg-[#0f1e14]">
                <p className="font-medium">Бухгалтер (accountant)</p>
                <p className="mt-1 text-sm text-[#6b7280]">Корма, расходы, продажи, аналитика.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <InviteUserSection />
        <UserManagementSection />
      </div>
    </section>
  );
}
