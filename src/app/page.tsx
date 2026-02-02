"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TradingData {
  solBalance: number;
  solBalanceUsd: number;
  positionValue: number;
  positionValueUsd: number;
  totalPortfolio: number;
  totalPortfolioUsd: number;
  positionCount: number;
  pnl: {
    netPnl: number;
    netPnlPercent: string;
  };
  today: {
    netPnl: number;
    netPnlUsd: number;
  };
}

interface StudyData {
  currentWeek: number;
  currentDay: number;
  currentTopic: string;
  progress: number;
}

interface CostsData {
  monthToDate: number;
  projectedMonthly: number;
}

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [trading, setTrading] = useState<TradingData | null>(null);
  const [study, setStudy] = useState<StudyData | null>(null);
  const [costs, setCosts] = useState<CostsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tradingRes, studyRes, costsRes] = await Promise.all([
          fetch("/api/trading"),
          fetch("/api/study"),
          fetch("/api/costs"),
        ]);

        if (tradingRes.ok) setTrading(await tradingRes.json());
        if (studyRes.ok) setStudy(await studyRes.json());
        if (costsRes.ok) setCosts(await costsRes.json());
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Trading Bot",
      icon: "📈",
      href: "/trading",
      value: trading ? `${trading.pnl.netPnlPercent}%` : "--",
      subtext: "All-time P&L",
      color: "from-green-600 to-green-800",
    },
    {
      title: "Study Progress",
      icon: "📚",
      href: "/study",
      value: study ? `Week ${study.currentWeek}` : "--",
      subtext: study ? `Day ${study.currentDay}: ${(study.currentTopic || "").split(" ")[0] || "Study"}...` : "Loading...",
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "Active Ideas",
      icon: "💡",
      href: "/ideas",
      value: "3",
      subtext: "Tracks in progress",
      color: "from-purple-600 to-purple-800",
    },
    {
      title: "API Costs",
      icon: "💰",
      href: "/costs",
      value: costs ? `$${Number(costs.monthToDate ?? 0).toFixed(0)}` : "--",
      subtext: "This month",
      color: "from-orange-600 to-orange-800",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Jack 👋</h1>
        <p className="text-gray-500">
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          •{" "}
          {time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-5 hover:scale-105 transition-transform`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <h3 className="font-semibold">{card.title}</h3>
            <p className="text-sm text-white/70 truncate">{card.subtext}</p>
          </Link>
        ))}
      </div>

      {/* Portfolio Holdings */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">💰 Holdings</h2>
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Available SOL</p>
            <p className="text-2xl font-bold font-mono">
              {trading ? Number(trading.solBalance ?? 0).toFixed(2) : "--"} SOL
            </p>
            <p className="text-gray-500 text-sm">
              ~${trading ? Number(trading.solBalanceUsd ?? 0).toFixed(0) : "--"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">In Open Positions</p>
            <p className="text-2xl font-bold font-mono">
              ~{trading ? Number(trading.positionValue ?? 0).toFixed(2) : "--"} SOL
            </p>
            <p className="text-gray-500 text-sm">
              {trading ? `${trading.positionCount ?? 0} tokens` : "--"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Portfolio</p>
            <p className={`text-2xl font-bold font-mono ${trading && Number(trading.pnl?.netPnl ?? 0) > 0 ? "text-green-400" : ""}`}>
              ~{trading ? Number(trading.totalPortfolio ?? 0).toFixed(2) : "--"} SOL
            </p>
            <p className="text-gray-500 text-sm">
              ~${trading ? Number(trading.totalPortfolioUsd ?? 0).toFixed(0) : "--"}
            </p>
          </div>
        </div>
        
        {/* Today's P&L */}
        {trading && (
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-gray-400">Today&apos;s P&L</span>
            <span className={`font-mono font-bold ${Number(trading.today?.netPnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {Number(trading.today?.netPnl ?? 0) >= 0 ? "+" : ""}{Number(trading.today?.netPnl ?? 0).toFixed(4)} SOL 
              ({Number(trading.today?.netPnlUsd ?? 0) >= 0 ? "+" : ""}${Number(trading.today?.netPnlUsd ?? 0).toFixed(2)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
