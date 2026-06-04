export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import Pagination from "@/components/pagination";
import ExportWeighingsButton from "@/components/export-weighings-button";
import WeighingsSearch from "@/components/weighings-search";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/format-date";

const PAGE_SIZE = 15;

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function WeighingsPage({ searchParams }: Props) {
  const { page: pageParam, search } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Stats (all weighings)
  const { data: allWeighings } = await supabase
    .from("weighings")
    .select("weight, weighing_date")
    .order("weighing_date", { ascending: false });

  const safeAll = allWeighings ?? [];
  const totalWeighings = safeAll.length;
  const avgWeight =
    totalWeighings > 0
      ? Math.round(
          safeAll.reduce((sum, w) => sum + Number(w.weight || 0), 0) / totalWeighings
        )
      : 0;
  const latestDate = totalWeighings > 0 ? safeAll[0].weighing_date : "—";

  // Если есть поиск — сначала находим animal_id по коду
  let animalIds: number[] | null = null;
  if (search) {
    const { data: matched } = await supabase
      .from("livestock")
      .select("id")
      .ilike("animal_code", `%${search}%`);
    animalIds = (matched ?? []).map((a) => a.id);
  }

  // Paginated + filtered
  let query = supabase
    .from("weighings")
    .select(
      "id, weighing_date, weight, comment, animal_id, livestock(animal_code, batch)",
      { count: "exact" }
    )
    .order("weighing_date", { ascending: false })
    .range(from, to);

  if (animalIds !== null) {
    if (animalIds.length === 0) {
      // Поиск не дал результатов — возвращаем пустой список
      query = query.in("animal_id", [-1]);
    } else {
      query = query.in("animal_id", animalIds);
    }
  }

  const { data: weighings, count, error } = await query;

  const safeWeighings = weighings ?? [];
  const totalCount = count ?? 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Контроль привеса</p>
          <h2 className="mt-1 text-3xl font-semibold">Взвешивания</h2>
        </div>

        <div className="flex gap-3">
          <ExportWeighingsButton />
          <Link
            href="/weighings/new"
            className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
          >
            + Добавить взвешивание
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего взвешиваний" value={String(totalWeighings)} />
        <StatCard title="Средний вес" value={`${avgWeight} кг`} />
        <StatCard title="Последняя дата" value={formatDate(String(latestDate))} />
        <StatCard
          title="Активность"
          value={totalWeighings > 0 ? "Есть данные" : "Нет данных"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="История взвешиваний" eyebrow="Взвешивания">
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки взвешиваний.
              </div>
            ) : (
              <div className="space-y-5">
                <WeighingsSearch search={search ?? ""} />

                <div className="text-sm text-[#6b7280]">
                  {search
                    ? `По запросу «${search}»: ${totalCount}`
                    : `Найдено: ${totalCount}`}
                </div>

                {safeWeighings.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                    {search ? "Животное не найдено." : "Пока взвешиваний нет."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeWeighings.map((item) => {
                      const animalCode = Array.isArray(item.livestock)
                        ? item.livestock[0]?.animal_code
                        : (item.livestock as { animal_code: string; batch: string | null } | null)?.animal_code;

                      const batchName = Array.isArray(item.livestock)
                        ? item.livestock[0]?.batch
                        : (item.livestock as { animal_code: string; batch: string | null } | null)?.batch;

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-lg font-semibold">
                                {animalCode || "Неизвестное животное"}
                              </p>
                              <p className="mt-1 text-sm text-[#6b7280]">
                                {batchName || "Партия не указана"}
                              </p>
                            </div>

                            <p className="text-lg font-semibold text-[#1f4d3a]">
                              {item.weight} кг
                            </p>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                              <p className="text-[#6b7280]">Дата</p>
                              <p className="mt-1 font-medium">{formatDate(item.weighing_date)}</p>
                            </div>

                            <div className="rounded-2xl bg-white p-3 ring-1 ring-[#eef2ea]">
                              <p className="text-[#6b7280]">Комментарий</p>
                              <p className="mt-1 font-medium">
                                {item.comment || "Без комментария"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end">
                            <Link
                              href={`/weighings/${item.id}/edit`}
                              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                            >
                              Изменить
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Pagination page={page} totalCount={totalCount} pageSize={PAGE_SIZE} />
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Краткий обзор" eyebrow="Сводка">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Всего записей</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {totalWeighings} взвешиваний в базе.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Средний вес</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {avgWeight} кг по всем записям.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
