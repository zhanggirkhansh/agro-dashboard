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

type DataPoint = {
  name: string;
  value: number;
};

type Props = {
  data: DataPoint[];
};

type TooltipEntry = {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipEntry) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-[#e6ebdf]">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="mt-1 font-semibold text-[#1f4d3a]">
        {payload[0].value} кг
      </p>
    </div>
  );
}

export default function WeightGainChart({ data }: Props) {
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
          <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d2" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
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
