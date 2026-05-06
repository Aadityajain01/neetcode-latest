"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistoryPoint = {
  year: number;
  averageSalary: number;
  demandChange: number;
};

type ChartMode = "salary" | "demand" | "both";

type TechHistoryAreaChartProps = {
  history: HistoryPoint[];
};

const modes: Array<{ id: ChartMode; label: string }> = [
  { id: "salary", label: "Salary" },
  { id: "demand", label: "Demand" },
  { id: "both", label: "Both" },
];

export default function TechHistoryAreaChart({ history }: TechHistoryAreaChartProps) {
  const [mode, setMode] = useState<ChartMode>("both");

  return (
    <div className="border border-zinc-800/60 bg-zinc-950/30 p-5 space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-2">
            Salary And Demand Trend
          </h2>
          <p className="text-sm text-zinc-400">
            Year-on-year backend salary growth from 2016 to 2026 with demand-change tracking.
          </p>
        </div>

        <div className="inline-flex border border-zinc-800/60 bg-zinc-950/60">
          {modes.map((item) => {
            const active = mode === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={[
                  "px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors",
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/70",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              yAxisId="salary"
              stroke="#10b981"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(value) => `₹${value}L`}
              hide={mode === "demand"}
            />
            <YAxis
              yAxisId="demand"
              orientation="right"
              stroke="#60a5fa"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(value) => `${value}%`}
              hide={mode === "salary"}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "0px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "averageSalary") {
                  return [`₹${value} LPA`, "Average Salary"];
                }
                return [`${value}%`, "Demand Change"];
              }}
              labelFormatter={(label) => `Year ${label}`}
            />
            {(mode === "salary" || mode === "both") && (
              <Area
                yAxisId="salary"
                type="monotone"
                dataKey="averageSalary"
                stroke="#10b981"
                fill="url(#salaryGradient)"
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
            )}
            {(mode === "demand" || mode === "both") && (
              <Area
                yAxisId="demand"
                type="monotone"
                dataKey="demandChange"
                stroke="#3b82f6"
                fill="url(#demandGradient)"
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.22em] text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-emerald-500" />
          Average Salary
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-blue-500" />
          Demand Change
        </span>
      </div>
    </div>
  );
}
