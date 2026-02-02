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
  title: string;
  targetDate: string;
  currentWeek: number;
  currentDay: number;
  currentTopic: string;
  progress: number;
  completed: number;
  total: number;
  weeks: StudyWeek[];
}

export default function StudyPage() {
  const [data, setData] = useState<StudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/study");
        if (res.ok) {
          const studyData = await res.json();
          setData(studyData);
          setSelectedWeek(studyData.currentWeek - 1);
        }
      } catch (err) {
        console.error("Failed to fetch study plan:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading study plan...</div>;
  }

  if (!data) {
    return <div className="text-red-400">Failed to load study plan</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📚 Study Plan</h1>
        <p className="text-gray-500">{data.title} • Target: {data.targetDate}</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Overall Progress</span>
          <span className="text-sm text-gray-400">{data.progress}% ({data.completed}/{data.total} days)</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm">TODAY&apos;S FOCUS</p>
            <h2 className="text-2xl font-bold">{data.currentTopic}</h2>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Week {data.currentWeek}, Day {data.currentDay}</p>
            <p className="text-lg font-semibold">
              {data.weeks[data.currentWeek - 1]?.title || ""}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(data.currentTopic + " system design")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition-colors"
          >
            📺 Watch Videos
          </a>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(data.currentTopic + " interview")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition-colors"
          >
            📖 Read Articles
          </a>
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition-colors">
            🧠 Quiz Me
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📅 Schedule</h2>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm"
            >
              {data.weeks.map((week, i) => (
                <option key={i} value={i}>
                  Week {week.week}: {week.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            {data.weeks[selectedWeek]?.days.map((day, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  day.status === "current"
                    ? "bg-blue-600/20 border border-blue-600"
                    : day.status === "completed"
                    ? "bg-green-600/20"
                    : "bg-gray-800"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    day.status === "current"
                      ? "bg-blue-600"
                      : day.status === "completed"
                      ? "bg-green-600"
                      : "bg-gray-700"
                  }`}
                >
                  {day.status === "completed" ? "✓" : day.day}
                </div>
                <span className={day.status === "completed" ? "line-through text-gray-500" : ""}>
                  {day.topic}
                </span>
                {day.status === "current" && (
                  <span className="ml-auto text-xs bg-blue-600 px-2 py-1 rounded">TODAY</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Study Notes */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">📝 Study Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you learn today? Key concepts, insights, questions..."
            className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-blue-600"
          />
          <div className="flex justify-between items-center mt-3">
            <p className="text-gray-500 text-xs">{notes.length} characters</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
              Save Notes
            </button>
          </div>
        </div>
      </div>

      {/* Quick Quiz Section */}
      <div className="mt-6 bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">🧠 Quick Quiz: {data.currentTopic}</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="font-medium mb-3">What does the &quot;C&quot; in CAP stand for?</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">Concurrency</button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">Consistency</button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">Caching</button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">Clustering</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
