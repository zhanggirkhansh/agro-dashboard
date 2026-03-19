import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";

export default function BatchDetailPage() {
  const stats = [
    { title: "Количество голов", value: "48" },
    { title: "Средний вес", value: "309 кг" },
    { title: "Расходы", value: "₸ 1 240 000" },
    { title: "Прогноз прибыли", value: "₸ 540 000" },
  ];

  const animals = [
    {
      id: "KRS-004",
      weight: "318 кг",
      gain: "+83 кг",
      status: "Готовится к продаже",
    },
    {
      id: "KRS-005",
      weight: "314 кг",
      gain: "+85 кг",
      status: "Готовится к продаже",
    },
    {
      id: "KRS-006",
      weight: "306 кг",
      gain: "+79 кг",
      status: "Активный",
    },
    {
      id: "KRS-007",
      weight: "311 кг",
      gain: "+81 кг",
      status: "Активный",
    },
  ];

  const expenses = [
    { category: "Корм", amount: "₸ 820 000", date: "10 марта" },
    { category: "Транспорт", amount: "₸ 85 000", date: "8 марта" },
    { category: "Лечение", amount: "₸ 47 000", date: "6 марта" },
    { category: "Прочее", amount: "₸ 28 000", date: "4 марта" },
  ];

  const feedLog = [
    { feed: "Ячмень", amount: "420 кг", date: "Сегодня" },
    { feed: "Сено", amount: "180 кг", date: "Сегодня" },
    { feed: "Соль", amount: "6 кг", date: "Сегодня" },
  ];

  const weighings = [
    { date: "1 марта", avgWeight: "294 кг", dailyGain: "+0.92 кг" },
    { date: "7 марта", avgWeight: "301 кг", dailyGain: "+1.00 кг" },
    { date: "14 марта", avgWeight: "309 кг", dailyGain: "+1.14 кг" },
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Детали партии"
        title="Партия №2"
        actionLabel="Изменить партию"
      />

      <div className="mb-6 flex items-center gap-3">
        <StatusBadge status="Готовится к продаже" />
        <span className="text-sm text-[#6b7280]">
          Запущена 12 января · цикл откорма активен
        </span>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <SectionCard title="Животные в партии" eyebrow="Текущий состав">
            <div className="overflow-hidden rounded-2xl border border-[#ebf0e6]">
              <table className="min-w-full text-left">
                <thead className="bg-[#f8faf7] text-sm text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Текущий вес</th>
                    <th className="px-4 py-3">Привес</th>
                    <th className="px-4 py-3">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {animals.map((animal) => (
                    <tr
                      key={animal.id}
                      className="border-t border-[#ebf0e6] bg-white hover:bg-[#fbfcfa]"
                    >
                      <td className="px-4 py-4 font-medium">{animal.id}</td>
                      <td className="px-4 py-4">{animal.weight}</td>
                      <td className="px-4 py-4 font-medium text-[#2f6a4f]">
                        {animal.gain}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={animal.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Краткий обзор" eyebrow="Состояние партии">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Готовность к продаже</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Часть животных уже находится рядом с целевым весом реализации.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Расход кормов</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Текущий расход в пределах ожидаемой нормы.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8faf7] p-4">
              <p className="font-medium">Маржинальность</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Прогноз по прибыли остается положительным.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        <SectionCard title="Последние расходы" eyebrow="Финансы">
          <div className="space-y-3">
            {expenses.map((item) => (
              <div
                key={item.category + item.date}
                className="rounded-2xl border border-[#ebf0e6] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.category}</p>
                    <p className="text-sm text-[#6b7280]">{item.date}</p>
                  </div>
                  <p className="font-semibold">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Кормление" eyebrow="Последние списания">
          <div className="space-y-3">
            {feedLog.map((item) => (
              <div
                key={item.feed + item.date}
                className="rounded-2xl border border-[#ebf0e6] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.feed}</p>
                    <p className="text-sm text-[#6b7280]">{item.date}</p>
                  </div>
                  <p className="font-semibold">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Взвешивания" eyebrow="Последняя динамика">
          <div className="space-y-3">
            {weighings.map((item) => (
              <div
                key={item.date}
                className="rounded-2xl border border-[#ebf0e6] p-4"
              >
                <p className="font-medium">{item.date}</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Средний вес: {item.avgWeight}
                </p>
                <p className="mt-1 text-sm text-[#2f6a4f]">
                  Среднесуточный привес: {item.dailyGain}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}