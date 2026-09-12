"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useDarkMode } from "@/hooks/use-dark-mode";

type DataPoint = { date: string; weight: number };
type Props = { data: DataPoint[]; startWeight?: number };

type TooltipEntry = {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
  startWeight?: number;
  dark?: boolean;
};

function CustomTooltip({ active, payload, label, startWeight, dark }: TooltipEntry) {
  if (!active || !payload?.length) return null;
  const weight = payload[0].value ?? 0;
  const gain = startWeight != null ? weight - startWeight : null;
  return (
    <div
      className="rounded-2xl px-4 py-3 shadow-lg"
      style={{
        backgroundColor: dark ? "#122018" : "#ffffff",
        border: `1px solid ${dark ? "#1e3326" : "#e6ebdf"}`,
      }}
    >
      <p className="text-sm" style={{ color: dark ? "#7b9882" : "#6b7280" }}>{label}</p>
      <p className="mt-1 font-semibold" style={{ color: dark ? "#52c48a" : "#1f4d3a" }}>{weight} кг</p>
      {gain != null && (
        <p className={`text-sm font-medium ${gain >= 0 ? "text-[#2f6a4f]" : "text-[#b91c1c]"}`}>
          Привес: {gain >= 0 ? "+" : ""}{gain} кг
        </p>
      )}
    </div>
  );
}

export default function WeightChart({ data, startWeight }: Props) {
  const dark = useDarkMode();
  const grid = dark ? "#1e3326" : "#e6ebdf";
  const tick = dark ? "#7b9882" : "#6b7280";
  const lineColor = dark ? "#52c48a" : "#1f4d3a";

  const weights = data.map((d) => d.weight);
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 100;
  const padding = Math.max(10, Math.round((maxWeight - minWeight) * 0.2));
  const yMin = Math.max(0, (startWeight != null ? Math.min(startWeight, minWeight) : minWeight) - padding);
  const yMax = maxWeight + padding;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: tick }} tickLine={false} axisLine={false} />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 12, fill: tick }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v} кг`}
          />
          <Tooltip content={<CustomTooltip startWeight={startWeight} dark={dark} />} />
          {startWeight != null && (
            <ReferenceLine
              y={startWeight}
              stroke="#d6a84f"
              strokeDasharray="5 4"
              strokeWidth={2}
              label={{ value: `Старт: ${startWeight} кг`, position: "insideTopRight", fontSize: 11, fill: "#d6a84f" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
