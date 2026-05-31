export const dynamic = "force-dynamic";

import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import Pagination from "@/components/pagination";
import ExportVaccinesButton from "@/components/export-vaccines-button";
import { supabase } from "@/lib/supabase";
import { getVaccineStatus, VACCINE_STATUS } from "@/constants/vaccines";

const PAGE_SIZE = 15;

const statusStyles: Record<string, string> = {
  [VACCINE_STATUS.DONE]: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  [VACCINE_STATUS.UPCOMING]: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  [VACCINE_STATUS.OVERDUE]: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

type Props = {
  searchParams: Promise<{ status?: string; vaccine?: string; page?: string }>;
};

export default async function VaccinesPage({ searchParams }: Props) {
  const { status, vaccine, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: allVaccines } = await supabase
    .from("vaccines")
    .select("id, next_vaccination_date, vaccine_name");

  const safeAll = allVaccines ?? [];
  const totalCount = safeAll.length;
  const overdueCount = safeAll.filter(
    (v) => getVaccineStatus(v.next_vaccination_date) === VACCINE_STATUS.OVERDUE
  ).length;
  const upcomingCount = safeAll.filter(
    (v) => getVaccineStatus(v.next_vaccination_date) === VACCINE_STATUS.UPCOMING
  ).length;
  const vaccineNames = Array.from(new Set(safeAll.map((v) => v.vaccine_name)));

  // Overdue / upcoming for sidebar
  const { data: alertVaccines } = await supabase
    .from("vaccines")
    .select("id, vaccine_name, next_vaccination_date, livestock(animal_code)")
    .not("next_vaccination_date", "is", null)
    .lte("next_vaccination_date", new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0])
    .order("next_vaccination_date", { ascending: true })
    .limit(10);

  // Paginated list
  let query = supabase
    .from("vaccines")
    .select(
      "id, vaccine_name, vaccination_date, next_vaccination_date, dose, veterinarian, vaccine_lot, comment, animal_id, batch_id, livestock(animal_code), batches(batch_name)",
      { count: "exact" }
    )
    .order("vaccination_date", { ascending: false })
    .range(from, to);

  if (vaccine) query = query.eq("vaccine_name", vaccine);

  const { data: vaccines, count, error } = await query;

  const safeVaccines = (vaccines ?? []).filter((v) => {
    if (!status) return true;
    return getVaccineStatus(v.next_vaccination_date) === status;
  });

  const paginatedCount = count ?? 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Ветеринарный учёт</p>
          <h2 className="mt-1 text-3xl font-semibold">Вакцинации</h2>
        </div>
        <div className="flex gap-3">
          <ExportVaccinesButton />
          <Link
            href="/vaccines/new"
            className="inline-flex rounded-2xl bg-[#1f4d3a] px-5 py-3 font-medium text-white shadow-sm hover:opacity-90"
          >
            + Добавить
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard title="Всего вакцинаций" value={String(totalCount)} />
        <StatCard
          title="Просрочено"
          value={String(overdueCount)}
          change={overdueCount > 0 ? "Требует внимания" : "Всё в порядке"}
        />
        <StatCard
          title="Предстоит (30 дней)"
          value={String(upcomingCount)}
          change="Запланировано"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Список вакцинаций" eyebrow="Журнал">
            {error ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки данных.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Фильтры */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Все", s: "" },
                    { label: "✅ Выполнено", s: VACCINE_STATUS.DONE },
                    { label: "⚠️ Скоро", s: VACCINE_STATUS.UPCOMING },
                    { label: "🔴 Просрочено", s: VACCINE_STATUS.OVERDUE },
                  ].map(({ label, s }) => (
                    <Link
                      key={s || "all"}
                      href={`/vaccines${s ? `?status=${encodeURIComponent(s)}` : ""}${vaccine ? `${s ? "&" : "?"}vaccine=${encodeURIComponent(vaccine)}` : ""}`}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        (status ?? "") === s
                          ? "bg-[#1f4d3a] text-white"
                          : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Фильтр по вакцине */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/vaccines${status ? `?status=${encodeURIComponent(status)}` : ""}`}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      !vaccine
                        ? "bg-[#1f4d3a] text-white"
                        : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                    }`}
                  >
                    Все вакцины
                  </Link>
                  {vaccineNames.map((name) => (
                    <Link
                      key={name}
                      href={`/vaccines?vaccine=${encodeURIComponent(name)}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        vaccine === name
                          ? "bg-[#1f4d3a] text-white"
                          : "bg-white text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                      }`}
                    >
                      {name}
                    </Link>
                  ))}
                </div>

                <div className="text-sm text-[#6b7280]">
                  Найдено: {safeVaccines.length}
                </div>

                {safeVaccines.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-center text-sm text-[#6b7280]">
                    Записей нет.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {safeVaccines.map((v) => {
                      const vStatus = getVaccineStatus(v.next_vaccination_date);
                      const animalCode = Array.isArray(v.livestock)
                        ? v.livestock[0]?.animal_code
                        : (v.livestock as { animal_code: string } | null)?.animal_code;
                      const batchName = Array.isArray(v.batches)
                        ? v.batches[0]?.batch_name
                        : (v.batches as { batch_name: string } | null)?.batch_name;

                      return (
                        <div
                          key={v.id}
                          className="rounded-2xl border border-[#ebf0e6] bg-white p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{v.vaccine_name}</p>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[vStatus] ?? statusStyles[VACCINE_STATUS.DONE]}`}
                                >
                                  {vStatus}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-[#6b7280]">
                                {animalCode
                                  ? `Животное: ${animalCode}`
                                  : batchName
                                    ? `Партия: ${batchName}`
                                    : "Без привязки"}
                              </p>
                            </div>
                            <Link
                              href={`/vaccines/${v.id}/edit`}
                              className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
                            >
                              Изменить
                            </Link>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                            <div className="rounded-xl bg-[#f8faf7] p-3">
                              <p className="text-[#6b7280]">Дата</p>
                              <p className="mt-1 font-medium">
                                {new Date(v.vaccination_date).toLocaleDateString("ru-RU")}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#f8faf7] p-3">
                              <p className="text-[#6b7280]">Следующая</p>
                              <p className={`mt-1 font-medium ${vStatus === VACCINE_STATUS.OVERDUE ? "text-[#b91c1c]" : vStatus === VACCINE_STATUS.UPCOMING ? "text-[#d97706]" : ""}`}>
                                {v.next_vaccination_date
                                  ? new Date(v.next_vaccination_date).toLocaleDateString("ru-RU")
                                  : "—"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#f8faf7] p-3">
                              <p className="text-[#6b7280]">Доза</p>
                              <p className="mt-1 font-medium">{v.dose || "—"}</p>
                            </div>

                            <div className="rounded-xl bg-[#f8faf7] p-3">
                              <p className="text-[#6b7280]">Ветеринар</p>
                              <p className="mt-1 font-medium">{v.veterinarian || "—"}</p>
                            </div>
                          </div>

                          {(v.vaccine_lot || v.comment) && (
                            <div className="mt-2 flex gap-4 text-xs text-[#6b7280]">
                              {v.vaccine_lot && <span>Серия: {v.vaccine_lot}</span>}
                              {v.comment && <span>{v.comment}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <Pagination
                  page={page}
                  totalCount={paginatedCount}
                  pageSize={PAGE_SIZE}
                />
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sidebar: алерты */}
        <div className="space-y-5">
          {overdueCount > 0 && (
            <SectionCard title="Просрочено" eyebrow="Требует внимания">
              <div className="space-y-3">
                {(alertVaccines ?? [])
                  .filter((v) => getVaccineStatus(v.next_vaccination_date) === VACCINE_STATUS.OVERDUE)
                  .map((v) => {
                    const animalCode = Array.isArray(v.livestock)
                      ? v.livestock[0]?.animal_code
                      : (v.livestock as { animal_code: string } | null)?.animal_code;
                    return (
                      <div key={v.id} className="rounded-2xl bg-[#fef2f2] p-3">
                        <p className="text-sm font-medium text-[#b91c1c]">
                          {animalCode || "Животное"}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6b7280]">
                          {v.vaccine_name} · до{" "}
                          {new Date(v.next_vaccination_date!).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Предстоят" eyebrow="Ближайшие 30 дней">
            {upcomingCount === 0 ? (
              <p className="text-sm text-[#6b7280]">Нет запланированных.</p>
            ) : (
              <div className="space-y-3">
                {(alertVaccines ?? [])
                  .filter((v) => getVaccineStatus(v.next_vaccination_date) === VACCINE_STATUS.UPCOMING)
                  .map((v) => {
                    const animalCode = Array.isArray(v.livestock)
                      ? v.livestock[0]?.animal_code
                      : (v.livestock as { animal_code: string } | null)?.animal_code;
                    const daysLeft = Math.ceil(
                      (new Date(v.next_vaccination_date!).getTime() - Date.now()) / 86400000
                    );
                    return (
                      <div key={v.id} className="rounded-2xl bg-[#fffbf0] p-3">
                        <p className="text-sm font-medium text-[#92400e]">
                          {animalCode || "Животное"}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6b7280]">
                          {v.vaccine_name} · через {daysLeft} дн.
                        </p>
                      </div>
                    );
                  })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
