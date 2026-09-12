"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDarkMode } from "@/hooks/use-dark-mode";

type DataPoint = { name: string; value: number };
type Props = { data: DataPoint[] };

type TooltipEntry = {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
  dark?: boolean;
};

function CustomTooltip({ active, payload, label, dark }: TooltipEntry) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl px-4 py-3 shadow-lg"
      style={{
        backgroundColor: dark ? "#122018" : "#ffffff",
        border: `1px solid ${dark ? "#1e3326" : "#e6ebdf"}`,
      }}
    >
      <p className="text-sm" style={{ color: dark ? "#7b9882" : "#6b7280" }}>{label}</p>
      <p className="mt-1 font-semibold" style={{ color: dark ? "#52c48a" : "#1f4d3a" }}>
        {payload[0].value} кг
      </p>
    </div>
  );
}

export default function WeightGainChart({ data }: Props) {
  const dark = useDarkMode();
  const grid = dark ? "#1e3326" : "#d9e2d2";
  const tick = dark ? "#7b9882" : "#6b7280";

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-[#f8faf7]">
        <p className="text-sm text-[#6b7280]">Нет данных по взвешиваниям</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-2xl bg-[#f8faf7] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2f6a4f" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2f6a4f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: tick }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: tick }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
          <Tooltip content={<CustomTooltip dark={dark} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2f6a4f"
            strokeWidth={3}
            fill="url(#weightGradient)"
            dot={{ r: 4, fill: "#2f6a4f", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
