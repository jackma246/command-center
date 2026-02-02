"use client";

import { useEffect, useState } from "react";

interface CostItem {
  provider: string;
  cost: number;
  requests: number;
  tokens: number;
}

interface Optimization {
  done: boolean;
  text: string;
}

interface CostsData {
  monthToDate: number;
  monthlyBudget: number;
  projectedMonthly: number;
  dailyAverage: number;
  remaining: number;
  budgetUsedPercent: number;
  currentDay: number;
  daysInMonth: number;
  totalRequests: number;
  totalTokens: number;
  costs: CostItem[];
  optimizations: Optimization[];
  lastUpdated: string;
}

export default function CostsPage() {
  const [data, setData] = useState<CostsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/costs");
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Failed to fetch costs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!data) {
    return <div className="text-red-400">Failed to load cost data</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">💰 API Costs</h1>
        <p className="text-gray-500">
          February 2026 • Day {data.currentDay} of {data.daysInMonth}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Month to Date</p>
          <p className="text-3xl font-bold">${(data.monthToDate ?? 0).toFixed(2)}</p>
          <p className="text-gray-500 text-sm">of ${data.monthlyBudget ?? 50} budget</p>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Projected Monthly</p>
          <p className={`text-3xl font-bold ${(data.projectedMonthly ?? 0) > (data.monthlyBudget ?? 50) ? "text-red-400" : "text-green-400"}`}>
            ${(data.projectedMonthly ?? 0).toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm">at current pace</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Daily Average</p>
          <p className="text-3xl font-bold">${(data.dailyAverage ?? 0).toFixed(2)}</p>
          <p className="text-gray-500 text-sm">per day</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Remaining</p>
          <p className={`text-3xl font-bold ${(data.remaining ?? 0) > 0 ? "text-green-400" : "text-red-400"}`}>
            ${(data.remaining ?? 0).toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm">until budget cap</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Budget Usage</span>
          <span className="text-sm text-gray-400">{(data.budgetUsedPercent ?? 0).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              (data.budgetUsedPercent ?? 0) > 80 ? "bg-red-600" : (data.budgetUsedPercent ?? 0) > 60 ? "bg-yellow-600" : "bg-green-600"
            }`}
            style={{ width: `${Math.min(data.budgetUsedPercent ?? 0, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$0</span>
          <span>${data.monthlyBudget ?? 50}</span>
        </div>
      </div>

      {/* Breakdown by Provider */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
        <h2 className="text-lg font-semibold mb-4">📊 By Provider</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3">Provider</th>
                <th className="pb-3 text-right">Cost</th>
                <th className="pb-3 text-right">Requests</th>
                <th className="pb-3 text-right">Tokens</th>
                <th className="pb-3 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {(data.costs ?? []).map((c, i) => (
                <tr key={i} className="border-t border-gray-800">
                  <td className="py-3 font-medium">{c.provider}</td>
                  <td className="py-3 text-right font-mono">${(c.cost ?? 0).toFixed(2)}</td>
                  <td className="py-3 text-right text-gray-400">{(c.requests ?? 0).toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-400">{(c.tokens ?? 0) > 0 ? c.tokens.toLocaleString() : "-"}</td>
                  <td className="py-3 text-right text-gray-400">
                    {(data.monthToDate ?? 0) > 0 ? (((c.cost ?? 0) / data.monthToDate) * 100).toFixed(1) : "0"}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700 font-semibold">
                <td className="pt-3">Total</td>
                <td className="pt-3 text-right font-mono">${(data.monthToDate ?? 0).toFixed(2)}</td>
                <td className="pt-3 text-right">{(data.totalRequests ?? 0).toLocaleString()}</td>
                <td className="pt-3 text-right">{(data.totalTokens ?? 0).toLocaleString()}</td>
                <td className="pt-3 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cost Optimization Tips */}
      <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl p-5 border border-green-800/30">
        <h2 className="text-lg font-semibold mb-3">💡 Cost Optimization</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          {data.optimizations.map((opt, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={opt.done ? "text-green-400" : "text-yellow-400"}>
                {opt.done ? "✓" : "→"}
              </span>
              {opt.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
