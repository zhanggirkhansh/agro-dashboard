"use client";

import {
  PieChart,
  Pie,
  Cell,
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

const COLORS = ["#2f6a4f", "#d6a84f", "#7aa37a", "#94b49f", "#4a7c59", "#c8955a", "#d9e2d2"];

type TooltipEntry = {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
};

function CustomTooltip({ active, payload }: TooltipEntry) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-[#e6ebdf]">
      <p className="text-sm font-medium">{payload[0].name}</p>
      <p className="mt-1 text-sm text-[#1f4d3a]">
        ₸ {Number(payload[0].value ?? 0).toLocaleString("ru-RU")}
      </p>
    </div>
  );
}

export default function ExpensesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-[#f8faf7]">
        <p className="text-sm text-[#6b7280]">Нет данных по расходам</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-2xl bg-[#f8faf7] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Легенда */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs text-[#6b7280]">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}
