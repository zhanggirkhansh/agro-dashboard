import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import WeightChart from "@/components/weight-chart";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnimalPage({ params }: PageProps) {
  const { id } = await params;
  const animalId = Number(id);

  if (Number.isNaN(animalId)) {
    return (
      <section>
        <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
          Некорректный ID животного.
        </div>
      </section>
    );
  }

  const [{ data: animal, error: animalError }, { data: weighings, error: weighingsError }] =
    await Promise.all([
      supabase
        .from("livestock")
        .select(
          "id, animal_code, age, status, batch, start_weight, current_weight"
        )
        .eq("id", animalId)
        .single(),

      supabase
        .from("weighings")
        .select("id, weight, weighing_date, comment")
        .eq("animal_id", animalId)
        .order("weighing_date", { ascending: true }),
    ]);

  if (animalError || !animal) {
    return (
      <section>
        <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
          Не удалось загрузить карточку животного.
        </div>
      </section>
    );
  }

  const chartData =
    weighings?.map((w) => ({
      date: new Date(w.weighing_date).toLocaleDateString("ru-RU"),
      weight: Number(w.weight),
    })) ?? [];

  const currentWeight =
    animal.current_weight != null ? Number(animal.current_weight) : 0;

  const startWeight =
    animal.start_weight != null ? Number(animal.start_weight) : 0;

  const gain =
    animal.start_weight != null && animal.current_weight != null
      ? currentWeight - startWeight
      : 0;

  return (
    <section>
      <PageHeader
        eyebrow="Карточка животного"
        title={`Животное ${animal.animal_code || animal.id}`}
      />

      <div className="grid grid-cols-4 gap-5">
        <StatCard title="Текущий вес" value={`${currentWeight} кг`} />
        <StatCard title="Привес" value={`${gain >= 0 ? "+" : ""}${gain} кг`} />
        <StatCard
          title="Количество взвешиваний"
          value={String(chartData.length)}
        />
        <StatCard title="Статус" value={animal.status || "Активный"} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <SectionCard title="Динамика веса" eyebrow="История измерений">
            {chartData.length === 0 ? (
              <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
                Пока нет данных по взвешиваниям.
              </div>
            ) : (
              <WeightChart data={chartData} />
            )}
          </SectionCard>
        </div>

        <SectionCard title="Информация" eyebrow="Основные данные">
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[#6b7280]">ID</p>
              <p className="font-medium">{animal.id}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Код животного</p>
              <p className="font-medium">{animal.animal_code || "—"}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Возраст</p>
              <p className="font-medium">{animal.age || "—"}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Партия</p>
              <p className="font-medium">{animal.batch || "—"}</p>
            </div>

            <div>
              <p className="text-[#6b7280]">Стартовый вес</p>
              <p className="font-medium">
                {animal.start_weight != null ? `${animal.start_weight} кг` : "—"}
              </p>
            </div>

            <div>
              <p className="text-[#6b7280]">Текущий вес</p>
              <p className="font-medium">
                {animal.current_weight != null
                  ? `${animal.current_weight} кг`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-[#6b7280]">Статус</p>
              <p className="font-medium">{animal.status || "Активный"}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="История взвешиваний" eyebrow="Последние записи">
          {weighingsError ? (
            <div className="rounded-2xl bg-[#fef2f2] px-4 py-4 text-sm text-[#b91c1c]">
              Ошибка загрузки взвешиваний.
            </div>
          ) : chartData.length === 0 ? (
            <div className="rounded-2xl bg-[#f8faf7] px-4 py-6 text-sm text-[#6b7280]">
              Нет данных по взвешиваниям.
            </div>
          ) : (
            <div className="space-y-3">
              {weighings!.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#ebf0e6] bg-white p-4"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(item.weighing_date).toLocaleDateString("ru-RU")}
                    </p>
                    <p className="mt-1 text-sm text-[#6b7280]">
                      {item.comment || "Без комментария"}
                    </p>
                  </div>

                  <p className="font-semibold">{item.weight} кг</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}