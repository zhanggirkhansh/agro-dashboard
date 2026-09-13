"use client";

import { useState } from "react";

type Props = {
  totalCurrentWeight: number;
  totalExpenses: number;
  totalRevenue: number;
  animalsCount: number;
};

export default function BatchProfitForecast({
  totalCurrentWeight,
  totalExpenses,
  totalRevenue,
  animalsCount,
}: Props) {
  const [pricePerKg, setPricePerKg] = useState("");

  const price = Number(pricePerKg) || 0;
  const forecastSaleRevenue = totalCurrentWeight * price;
  const combinedRevenue = totalRevenue + forecastSaleRevenue;
  const forecastProfit = combinedRevenue - totalExpenses;
  const forecastRoi = totalExpenses > 0 ? (forecastProfit / totalExpenses) * 100 : null;

  const hasPrice = price > 0;
  const profitColor = forecastProfit >= 0 ? "text-[#2f6a4f]" : "text-[#b91c1c]";
  const roiColor =
    forecastRoi === null ? "text-[#6b7280]" : forecastRoi >= 0 ? "text-[#2f6a4f]" : "text-[#b91c1c]";

  return (
    <div className="space-y-4">
      {/* Ввод цены */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Рыночная цена за кг (₸)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="100"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
            placeholder="Введите цену, например 1500"
            className="w-full max-w-xs rounded-2xl border border-[#d9e2d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f4d3a]"
          />
          {pricePerKg && (
            <button
              type="button"
              onClick={() => setPricePerKg("")}
              className="text-sm text-[#6b7280] hover:text-[#1f4d3a]"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Таблица прогноза */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#f8faf7] p-4">
          <p className="text-sm text-[#6b7280]">Вес к реализации</p>
          <p className="mt-1 text-xl font-semibold">
            {totalCurrentWeight.toLocaleString("ru-RU")} кг
          </p>
          <p className="mt-0.5 text-xs text-[#6b7280]">{animalsCount} голов</p>
        </div>

        <div className="rounded-2xl bg-[#f8faf7] p-4">
          <p className="text-sm text-[#6b7280]">Прогноз выручки</p>
          <p className="mt-1 text-xl font-semibold">
            {hasPrice
              ? `₸ ${forecastSaleRevenue.toLocaleString("ru-RU")}`
              : "—"}
          </p>
          <p className="mt-0.5 text-xs text-[#6b7280]">
            {hasPrice ? `${totalCurrentWeight} кг × ₸${price.toLocaleString("ru-RU")}` : "Введите цену"}
          </p>
        </div>

        {totalRevenue > 0 && (
          <div className="rounded-2xl bg-[#f8faf7] p-4">
            <p className="text-sm text-[#6b7280]">Уже реализовано</p>
            <p className="mt-1 text-xl font-semibold">
              ₸ {totalRevenue.toLocaleString("ru-RU")}
            </p>
            <p className="mt-0.5 text-xs text-[#6b7280]">Фактическая выручка</p>
          </div>
        )}

        <div className="rounded-2xl bg-[#f8faf7] p-4">
          <p className="text-sm text-[#6b7280]">Расходы партии</p>
          <p className="mt-1 text-xl font-semibold">
            {totalExpenses > 0 ? `₸ ${totalExpenses.toLocaleString("ru-RU")}` : "—"}
          </p>
          <p className="mt-0.5 text-xs text-[#6b7280]">Фактические затраты</p>
        </div>
      </div>

      {/* Итог прогноза */}
      {hasPrice && (
        <div className="rounded-2xl border border-[#ebf0e6] bg-white p-5">
          <p className="mb-4 text-sm font-medium text-[#6b7280]">Итог прогноза</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[#6b7280]">Всего выручка</p>
              <p className="mt-1 text-lg font-semibold">
                ₸ {combinedRevenue.toLocaleString("ru-RU")}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b7280]">Прогноз прибыли</p>
              <p className={`mt-1 text-lg font-semibold ${profitColor}`}>
                {forecastProfit >= 0 ? "+" : ""}₸ {forecastProfit.toLocaleString("ru-RU")}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b7280]">Прогноз ROI</p>
              <p className={`mt-1 text-lg font-semibold ${roiColor}`}>
                {forecastRoi !== null
                  ? `${forecastRoi >= 0 ? "+" : ""}${forecastRoi.toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>

          {forecastProfit >= 0 ? (
            <p className="mt-4 rounded-2xl bg-[#f0fdf4] px-4 py-3 text-sm text-[#2f6a4f]">
              При цене ₸{price.toLocaleString("ru-RU")}/кг партия выйдет в плюс на ₸{forecastProfit.toLocaleString("ru-RU")}.
            </p>
          ) : (
            <p className="mt-4 rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              При цене ₸{price.toLocaleString("ru-RU")}/кг убыток составит ₸{Math.abs(forecastProfit).toLocaleString("ru-RU")}. Нужна цена выше ₸{totalExpenses > 0 && totalCurrentWeight > 0 ? Math.ceil((totalExpenses - totalRevenue) / totalCurrentWeight).toLocaleString("ru-RU") : "—"}/кг чтобы выйти в ноль.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
