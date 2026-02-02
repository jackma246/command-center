"use client";

import { useState } from "react";

interface Accomplishment {
  id: string;
  time: string;
  category: "trading" | "study" | "project" | "other";
  description: string;
  details?: string;
}

const todayAccomplishments: Accomplishment[] = [
  {
    id: "1",
    time: "8:00 AM",
    category: "study",
    description: "Daily study reminder cron fired",
    details: "Week 1, Day 1: CAP Theorem & Consistency Models",
  },
  {
    id: "2",
    time: "8:31 AM",
    category: "other",
    description: "Voice message transcription working",
    details: "Set up Whisper small model for Telegram voice messages",
  },
  {
    id: "3",
    time: "8:54 AM",
    category: "trading",
    description: "Portfolio report generated",
    details: "All-time: +0.75 SOL (+5.7%), Today: -$20.25",
  },
  {
    id: "4",
    time: "10:22 AM",
    category: "trading",
    description: "AUTARDIO trailing stop upgraded",
    details: "Moved to TIER_1 (+15.6% P&L)",
  },
  {
    id: "5",
    time: "10:25 AM",
    category: "project",
    description: "Command Center dashboard created",
    details: "Next.js + Tailwind dark theme, 5 modules",
  },
  {
    id: "6",
    time: "10:27 AM",
    category: "project",
    description: "Unit tests passing",
    details: "32 tests for helius.ts and study-parser.ts",
  },
];

const categoryColors = {
  trading: "bg-green-600/20 text-green-400 border-green-600/50",
  study: "bg-blue-600/20 text-blue-400 border-blue-600/50",
  project: "bg-purple-600/20 text-purple-400 border-purple-600/50",
  other: "bg-gray-600/20 text-gray-400 border-gray-600/50",
};

const categoryLabels = {
  trading: "Trading",
  study: "Study",
  project: "Project",
  other: "Other",
};

export default function TodayPage() {
  const [newItem, setNewItem] = useState("");
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const countByCategory = todayAccomplishments.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">✅ Today&apos;s Accomplishments</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div
            key={key}
            className={`rounded-lg p-3 border ${categoryColors[key as keyof typeof categoryColors]}`}
          >
            <p className="text-2xl font-bold">{countByCategory[key] || 0}</p>
            <p className="text-sm opacity-80">{label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
        <h2 className="text-lg font-semibold mb-4">📋 Timeline</h2>
        <div className="space-y-4">
          {todayAccomplishments.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-3 bg-gray-800 rounded-lg"
            >
              <div className="text-gray-500 font-mono text-sm w-20 flex-shrink-0">
                {item.time}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${
                      categoryColors[item.category]
                    }`}
                  >
                    {categoryLabels[item.category]}
                  </span>
                  <span className="font-medium">{item.description}</span>
                </div>
                {item.details && (
                  <p className="text-sm text-gray-400">{item.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">➕ Log Accomplishment</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="What did you accomplish?"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
          />
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="mt-6 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl p-5 border border-green-800/30">
        <h2 className="text-lg font-semibold mb-2">📊 Daily Summary</h2>
        <p className="text-gray-300">
          <strong>{todayAccomplishments.length} things accomplished today.</strong>{" "}
          Trading bot running autonomously. Command Center dashboard built. Voice transcription working.
        </p>
        <p className="text-gray-400 mt-2 text-sm">
          Net trading P&L: -$20.25 | Bot still profitable all-time (+5.7%)
        </p>
      </div>
    </div>
  );
}
