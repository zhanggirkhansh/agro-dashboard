export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import LivestockTable from "@/components/livestock-table";
import { supabase } from "@/lib/supabase";

export default async function LivestockPage() {
  const { data: animals, error } = await supabase
    .from("livestock")
    .select("*")
    .order("created_at", { ascending: false });

  const safeAnimals = animals ?? [];

  const totalAnimals = safeAnimals.length;

  const activeAnimals = safeAnimals.filter(
    (item) => item.status === "Активный"
  ).length;

  const sellingAnimals = safeAnimals.filter(
    (item) => item.status === "Готовится к продаже"
  ).length;

  const avgWeight =
    safeAnimals.length > 0
      ? Math.round(
          safeAnimals.reduce(
            (sum, item) => sum + Number(item.current_weight || 0),
            0
          ) / safeAnimals.length
        )
      : 0;

  const insights = [
    {
      title: "Всего животных",
      description: `${totalAnimals} записей загружено из базы.`,
    },
    {
      title: "Активные",
      description: `${activeAnimals} животных сейчас в активной фазе.`,
    },
    {
      title: "На продаже",
      description: `${sellingAnimals} животных готовятся к реализации.`,
    },
  ];

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Раздел учета КРС</p>
          <h2 className="mt-1 text-3xl font-semibold">Поголовье</h2>
        </div>

        <Link
          href="/livestock/new"
          className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
        >
          + Добавить животное
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего животных" value={String(totalAnimals)} />
        <StatCard title="Активных" value={String(activeAnimals)} />
        <StatCard title="На продаже" value={String(sellingAnimals)} />
        <StatCard title="Средний вес" value={`${avgWeight} кг`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Список животных"
            eyebrow="Реальные данные из Supabase"
          >
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки животных.
              </div>
            ) : safeAnimals.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока животных нет. Добавь первую запись.
              </div>
            ) : (
              <LivestockTable animals={safeAnimals} />
            )}
          </SectionCard>
        </div>

        <SectionCard title="Быстрый обзор" eyebrow="Инсайты по поголовью">
          <div className="space-y-4">
            {insights.map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}