import PageHeader from "@/components/page-header";
import SectionCard from "@/components/section-card";
import StatCard from "@/components/stat-card";

export default function SettingsPage() {
  const stats = [
    { title: "Хозяйство", value: "WestKaz Agro" },
    { title: "Валюта", value: "KZT (₸)" },
    { title: "Единицы", value: "кг, т, рулон" },
    { title: "Статусы", value: "4 активных" },
  ];

  const expenseCategories = [
    "Корм",
    "Транспорт",
    "Лечение",
    "Зарплата",
    "Прочее",
  ];

  const feedTypes = ["Ячмень", "Сено", "Соль", "Пшеница", "Комбикорм"];

  const animalStatuses = [
    "Активный",
    "Набор массы",
    "Готовится к продаже",
    "Продан",
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Системные параметры"
        title="Настройки"
        actionLabel="Сохранить изменения"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <SectionCard title="Основные параметры" eyebrow="Общие настройки">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Название хозяйства
                </label>
                <input
                  type="text"
                  defaultValue="WestKaz Agro"
                  className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Валюта</label>
                <select className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none">
                  <option>KZT (₸)</option>
                  <option>RUB (₽)</option>
                  <option>USD ($)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Базовая единица веса
                </label>
                <select className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none">
                  <option>кг</option>
                  <option>т</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Формат учета кормов
                </label>
                <select className="w-full rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 outline-none">
                  <option>кг</option>
                  <option>т</option>
                  <option>рулон</option>
                  <option>мешок</option>
                </select>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Категории расходов"
            eyebrow="Финансовая структура"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {expenseCategories.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] px-4 py-3"
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
                  className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] px-4 py-3"
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
                  className="rounded-2xl border border-[#ebf0e6] bg-[#fcfdfb] px-4 py-3"
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
              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="font-medium">Хозяйство</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Название и базовые системные параметры.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="font-medium">Категории</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Финансовые и кормовые справочники.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8faf7] p-4">
                <p className="font-medium">Статусы</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Состояния животных для учета и аналитики.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Следующий шаг" eyebrow="Развитие">
            <p className="text-sm text-[#6b7280]">
              Позже сюда можно добавить роли пользователей, авторизацию,
              системные справочники и управление доступом.
            </p>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}