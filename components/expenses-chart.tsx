"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Корм", value: 55 },
  { name: "Лечение", value: 10 },
  { name: "Транспорт", value: 15 },
  { name: "Зарплата", value: 12 },
  { name: "Прочее", value: 8 },
];

const colors = ["#2f6a4f", "#d6a84f", "#7aa37a", "#94b49f", "#d9e2d2"];

export default function ExpensesChart() {
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
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}