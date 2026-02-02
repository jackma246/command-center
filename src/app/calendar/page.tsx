"use client";

import { useEffect, useState } from "react";

interface StudyDay {
  day: number;
  topic: string;
  status: "completed" | "current" | "upcoming";
}

interface StudyWeek {
  week: number;
  title: string;
  days: StudyDay[];
}

interface StudyData {
  weeks: StudyWeek[];
  currentWeek: number;
  currentDay: number;
}

export default function CalendarPage() {
  const [study, setStudy] = useState<StudyData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/study");
        if (res.ok) setStudy(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generate calendar days for current month
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Map study plan to calendar (started Feb 2, 2026)
  const studyStartDate = new Date(2026, 1, 2); // Feb 2, 2026
  const getStudyForDate = (day: number) => {
    const date = new Date(year, month, day);
    const daysSinceStart = Math.floor((date.getTime() - studyStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceStart < 0 || daysSinceStart >= 28) return null;
    
    const weekIndex = Math.floor(daysSinceStart / 7);
    const dayIndex = daysSinceStart % 7;
    
    if (study?.weeks[weekIndex]?.days[dayIndex]) {
      return study.weeks[weekIndex].days[dayIndex];
    }
    return null;
  };

  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📅 Calendar</h1>
        <p className="text-gray-500">Study plan & daily progress</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedDate(new Date(year, month - 1, 1))}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => setSelectedDate(new Date(year, month + 1, 1))}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-gray-500 text-sm font-medium py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            if (day === null) {
              return <div key={i} className="h-24" />;
            }

            const studyItem = getStudyForDate(day);
            const todayClass = isToday(day) ? "ring-2 ring-blue-500" : "";
            
            let bgClass = "bg-gray-800";
            if (studyItem?.status === "completed") bgClass = "bg-green-900/30";
            else if (studyItem?.status === "current") bgClass = "bg-blue-900/30";

            return (
              <div
                key={i}
                className={`h-24 ${bgClass} ${todayClass} rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isToday(day) ? "text-blue-400" : ""}`}>
                    {day}
                  </span>
                  {studyItem?.status === "completed" && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                  {studyItem?.status === "current" && (
                    <span className="text-blue-400 text-xs">●</span>
                  )}
                </div>
                {studyItem && (
                  <p className="text-xs text-gray-400 line-clamp-3">
                    {studyItem.topic}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-900/30 rounded" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-900/30 rounded" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 rounded" />
          <span>Upcoming</span>
        </div>
      </div>

      {/* Today's Study */}
      {study && (
        <div className="mt-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-2">Today&apos;s Study</h3>
          <p className="text-xl font-bold">
            Week {study.currentWeek}, Day {study.currentDay}
          </p>
          <p className="text-blue-200">
            {study.weeks[study.currentWeek - 1]?.days[study.currentDay - 1]?.topic || "Rest day"}
          </p>
        </div>
      )}
    </div>
  );
}
