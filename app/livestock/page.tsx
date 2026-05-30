export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import LivestockTable from "@/components/livestock-table";
import LivestockFilters from "@/components/livestock-filters";
import Pagination from "@/components/pagination";
import ExportLivestockButton from "@/components/export-livestock-button";
import { supabase } from "@/lib/supabase";
import { LIVESTOCK_STATUS } from "@/constants/status";

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    batch?: string;
    page?: string;
  }>;
};

export default async function LivestockPage({ searchParams }: Props) {
  const { search, status, batch, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Stats query (all animals, no pagination)
  const { data: allAnimals } = await supabase
    .from("livestock")
    .select("status, current_weight");

  const safeAll = allAnimals ?? [];
  const totalAnimals = safeAll.length;
  const activeAnimals = safeAll.filter((a) => a.status === LIVESTOCK_STATUS.ACTIVE).length;
  const sellingAnimals = safeAll.filter(
    (a) => a.status === LIVESTOCK_STATUS.READY_FOR_SALE
  ).length;
  const avgWeight =
    totalAnimals > 0
      ? Math.round(
          safeAll.reduce((sum, a) => sum + Number(a.current_weight || 0), 0) /
            totalAnimals
        )
      : 0;

  // Filtered + paginated query
  let query = supabase
    .from("livestock")
    .select("id, animal_code, batch, age, start_weight, current_weight, status", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) query = query.ilike("animal_code", `%${search}%`);
  if (status) query = query.eq("status", status);
  if (batch) query = query.eq("batch", batch);

  const { data: animals, count, error } = await query;

  // Batches for filter dropdown
  const { data: batches } = await supabase
    .from("batches")
    .select("id, batch_name")
    .order("created_at", { ascending: false });

  const safeAnimals = animals ?? [];
  const totalCount = count ?? 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Раздел учета КРС</p>
          <h2 className="mt-1 text-3xl font-semibold">Поголовье</h2>
        </div>

        <div className="flex gap-3">
          <ExportLivestockButton />
          <Link
            href="/livestock/new"
            className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
          >
            + Добавить животное
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего животных" value={String(totalAnimals)} />
        <StatCard title="Активных" value={String(activeAnimals)} />
        <StatCard title="На продаже" value={String(sellingAnimals)} />
        <StatCard title="Средний вес" value={`${avgWeight} кг`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Список животных" eyebrow="Поголовье">
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки животных.
              </div>
            ) : (
              <div className="space-y-4">
                <LivestockFilters
                  batches={batches ?? []}
                  search={search ?? ""}
                  status={status ?? ""}
                  batch={batch ?? ""}
                />

                <div className="text-sm text-[#6b7280]">
                  Найдено: {totalCount}
                </div>

                <LivestockTable animals={safeAnimals} />

                <Pagination
                  page={page}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                />
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Быстрый обзор" eyebrow="Инсайты по поголовью">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Всего животных</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {totalAnimals} записей загружено из базы.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Активные</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {activeAnimals} животных сейчас в активной фазе.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">На продаже</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {sellingAnimals} животных готовятся к реализации.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
