"use client";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

type Item = {
  name: string;
  revenue: number;
  expenses: number;
};

type Props = {
  data: Item[];
};

export default function RevenueExpenseChart({ data }: Props) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip
            formatter={(value) => `₸ ${Number(value).toLocaleString("ru-RU")}`}
          />
          <Legend />
          <Bar dataKey="revenue" name="Доход" fill="#16a34a" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expenses" name="Расход"  fill="#dc2626" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}