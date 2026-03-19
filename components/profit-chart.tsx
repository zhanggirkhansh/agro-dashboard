"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type Props = {
  data: {
    name: string;
    profit: number;
    revenue: number;
    expenses: number;
  }[];
};

export default function ProfitChart({ data }: Props) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap={24}
          barGap={6}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d2" />
          <XAxis dataKey="name" tick={{ fontSize: 14 }} />
          <YAxis tick={{ fontSize: 14 }} />
          <Tooltip
            formatter={(value) => {
              const amount = Number(value ?? 0);
              return `₸ ${amount.toLocaleString("ru-RU")}`;
            }}
          />
          <Legend />
          <Bar
            dataKey="revenue"
            name="Доход"
            fill="#1f4d3a"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name="Расход"
            fill="#d6a84f"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="profit"
            name="Прибыль"
            fill="#4f46e5"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}