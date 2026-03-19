import Link from "next/link";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BatchDetailsPage({ params }: Props) {
  const { id } = await params;

  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("*")
    .eq("id", id)
    .single();

  const { data: animals, error: animalsError } = await supabase
    .from("livestock")
    .select("*")
    .eq("batch_id", id)
    .order("created_at", { ascending: false });

  if (batchError || !batch) {
    return (
      <section>
        <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
          Не удалось загрузить партию.
        </div>
      </section>
    );
  }

  const safeAnimals = animals ?? [];

  const avgCurrentWeight =
    safeAnimals.length > 0
      ? Math.round(
          safeAnimals.reduce(
            (sum, item) => sum + Number(item.current_weight || 0),
            0
          ) / safeAnimals.length
        )
      : 0;

  const totalGain =
    safeAnimals.length > 0
      ? safeAnimals.reduce((sum, item) => {
          const start = Number(item.start_weight || 0);
          const current = Number(item.current_weight || 0);
          return sum + (current - start);
        }, 0)
      : 0;

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6b7280]">Детальная карточка партии</p>
          <h2 className="mt-1 text-3xl font-semibold">{batch.batch_name}</h2>
        </div>

        <Link
          href="/batches"
          className="rounded-2xl bg-white px-5 py-3 font-medium text-[#1f4d3a] ring-1 ring-[#e6ebdf] hover:bg-[#f6f9f4]"
        >
          ← Назад к партиям
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <StatCard title="Голов в партии" value={String(batch.heads ?? 0)} />
        <StatCard title="Животных в базе" value={String(safeAnimals.length)} />
        <StatCard title="Средний текущий вес" value={`${avgCurrentWeight} кг`} />
        <StatCard title="Суммарный привес" value={`+${totalGain} кг`} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <SectionCard title="Информация о партии" eyebrow="Основные данные">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Название</p>
                <p className="mt-1 text-lg font-semibold">{batch.batch_name}</p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Статус</p>
                <div className="mt-2">
                  <StatusBadge status={batch.status || "Продан"} />
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Средний стартовый вес</p>
                <p className="mt-1 text-lg font-semibold">
                  {batch.start_weight != null ? `${batch.start_weight} кг` : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Средний текущий вес</p>
                <p className="mt-1 text-lg font-semibold">
                  {batch.current_weight != null ? `${batch.current_weight} кг` : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Расходы</p>
                <p className="mt-1 text-lg font-semibold">
                  {batch.expenses != null
                    ? `₸ ${Number(batch.expenses).toLocaleString("ru-RU")}`
                    : "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="text-[#6b7280]">Прогноз прибыли</p>
                <p className="mt-1 text-lg font-semibold text-[#2f6a4f]">
                  {batch.forecast_profit != null
                    ? `₸ ${Number(batch.forecast_profit).toLocaleString("ru-RU")}`
                    : "—"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Животные в партии" eyebrow="Связанные записи">
            {animalsError ? (
              <div className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                Ошибка загрузки животных.
              </div>
            ) : safeAnimals.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                В этой партии пока нет животных.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#ebf0e6]">
                <table className="min-w-full text-left">
                  <thead className="bg-[#f8faf7] text-sm text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3">Код</th>
                      <th className="px-4 py-3">Возраст</th>
                      <th className="px-4 py-3">Стартовый вес</th>
                      <th className="px-4 py-3">Текущий вес</th>
                      <th className="px-4 py-3">Привес</th>
                      <th className="px-4 py-3">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeAnimals.map((animal) => {
                      const gain =
                        animal.start_weight != null &&
                        animal.current_weight != null
                          ? Number(animal.current_weight) -
                            Number(animal.start_weight)
                          : null;

                      return (
                        <tr
                          key={animal.id}
                          className="border-t border-[#ebf0e6] bg-white hover:bg-[#fbfcfa]"
                        >
                          <td className="px-4 py-4 font-medium">
                            {animal.animal_code}
                          </td>
                          <td className="px-4 py-4">{animal.age || "—"}</td>
                          <td className="px-4 py-4">
                            {animal.start_weight != null
                              ? `${animal.start_weight} кг`
                              : "—"}
                          </td>
                          <td className="px-4 py-4">
                            {animal.current_weight != null
                              ? `${animal.current_weight} кг`
                              : "—"}
                          </td>
                          <td className="px-4 py-4 font-medium text-[#2f6a4f]">
                            {gain != null ? `+${gain} кг` : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={animal.status || "Продан"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Подсказки" eyebrow="Что дальше">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Связи готовы</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Теперь животных можно привязывать к конкретной партии через batch_id.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Следующий шаг</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Потом можно подтянуть сюда расходы, взвешивания и продажи по этой партии.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}