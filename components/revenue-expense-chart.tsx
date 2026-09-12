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
import { useDarkMode } from "@/hooks/use-dark-mode";

type Item = { name: string | null; revenue: number; expenses: number };
type Props = { data: Item[] };

export default function RevenueExpenseChart({ data }: Props) {
  const dark = useDarkMode();

  const grid = dark ? "#1e3326" : "#e6ebdf";
  const tick = dark ? "#7b9882" : "#6b7280";
  const tooltipStyle = {
    backgroundColor: dark ? "#122018" : "#ffffff",
    border: `1px solid ${dark ? "#1e3326" : "#e6ebdf"}`,
    borderRadius: "16px",
    color: dark ? "#ddeadf" : "#111827",
  };

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="name" hide />
          <YAxis tick={{ fontSize: 12, fill: tick }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => `₸ ${Number(value).toLocaleString("ru-RU")}`}
            contentStyle={tooltipStyle}
          />
          <Legend wrapperStyle={{ color: tick }} />
          <Bar dataKey="revenue" name="Доход" fill="#16a34a" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expenses" name="Расход" fill="#dc2626" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
