"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "1 мар", value: 242 },
  { name: "5 мар", value: 248 },
  { name: "10 мар", value: 255 },
  { name: "15 мар", value: 263 },
  { name: "20 мар", value: 271 },
  { name: "25 мар", value: 279 },
  { name: "30 мар", value: 287 },
];

export default function WeightGainChart() {
  return (
    <div className="h-72 w-full rounded-2xl bg-[#f8faf7] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d9e2d2" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2f6a4f"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}