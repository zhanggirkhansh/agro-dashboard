"use client";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import { useDarkMode } from "@/hooks/use-dark-mode";

type Item = { name: string | null; profit: number };
type Props = { data: Item[] };

export default function ProfitChart({ data }: Props) {
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
          <Bar dataKey="profit" name="Прибыль" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "#16a34a" : "#dc2626"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
