"use client";

import { useEffect, useState } from "react";

interface StudyDetails {
  keyConcepts: string[];
  resources: { type: string; title: string; url?: string; chapter?: string }[];
  practiceProblems: string[];
  timeEstimate: string;
  learningObjectives: string[];
}

interface StudyDay {
  day: number;
  topic: string;
  status: "completed" | "current" | "upcoming";
  details?: StudyDetails;
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
  const [selectedDay, setSelectedDay] = useState<StudyDay | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/study");
        if (res.ok) {
          const studyData = await res.json();
          setData(studyData);
          setSelectedWeek(studyData.currentWeek - 1);
          // Auto-select current day
          const currentDayData = studyData.weeks[studyData.currentWeek - 1]?.days.find(
            (d: StudyDay) => d.status === "current"
          );
          if (currentDayData) setSelectedDay(currentDayData);
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

  const currentDayDetails = selectedDay?.details;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📚 Study Plan</h1>
          <p className="text-gray-500">{data.title} • Target: {data.targetDate}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-400">{data.progress}%</p>
          <p className="text-gray-500 text-sm">{data.completed}/{data.total} days</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Schedule */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">📅 Schedule</h2>
            </div>
            
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4"
            >
              {data.weeks.map((week, i) => (
                <option key={i} value={i}>
                  Week {week.week}: {week.title}
                </option>
              ))}
            </select>
            
            <div className="space-y-2">
              {data.weeks[selectedWeek]?.days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedDay?.day === day.day && selectedDay?.topic === day.topic
                      ? "bg-blue-600/30 border border-blue-500"
                      : day.status === "current"
                      ? "bg-blue-600/20 border border-blue-600/50"
                      : day.status === "completed"
                      ? "bg-green-600/20"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      day.status === "current"
                        ? "bg-blue-600"
                        : day.status === "completed"
                        ? "bg-green-600"
                        : "bg-gray-700"
                    }`}
                  >
                    {day.status === "completed" ? "✓" : day.day}
                  </div>
                  <span className={`text-sm ${day.status === "completed" ? "line-through text-gray-500" : ""}`}>
                    {day.topic}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Day Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDay ? (
            <>
              {/* Today's Focus Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-200 text-sm">
                    WEEK {data.weeks[selectedWeek]?.week} • DAY {selectedDay.day}
                  </span>
                  {currentDayDetails?.timeEstimate && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      ⏱️ {currentDayDetails.timeEstimate}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{selectedDay.topic}</h2>
                {selectedDay.status === "current" && (
                  <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded text-sm">
                    📍 Today&apos;s Focus
                  </span>
                )}
              </div>

              {currentDayDetails ? (
                <>
                  {/* Learning Objectives */}
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-3">🎯 Learning Objectives</h3>
                    <ul className="space-y-2">
                      {currentDayDetails.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-gray-300">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Concepts */}
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-3">💡 Key Concepts</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentDayDetails.keyConcepts.map((concept, i) => (
                        <span key={i} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-3">📚 Resources</h3>
                    <div className="space-y-3">
                      {currentDayDetails.resources.map((resource, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                          <span className="text-xl">
                            {resource.type === "video" ? "📺" : resource.type === "book" ? "📖" : "📄"}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{resource.title}</p>
                            {resource.chapter && (
                              <p className="text-gray-500 text-sm">{resource.chapter}</p>
                            )}
                          </div>
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                            >
                              Open →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Problems */}
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-3">🧠 Practice Problems</h3>
                    <div className="space-y-3">
                      {currentDayDetails.practiceProblems.map((problem, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                          <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                            {i + 1}
                          </span>
                          <p className="text-gray-300">{problem}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <p className="text-gray-500">No detailed content available for this day yet.</p>
                </div>
              )}

              {/* Notes */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="text-lg font-semibold mb-3">📝 Your Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you learn? Key insights, questions, things to remember..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-blue-600"
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-gray-500 text-xs">{notes.length} characters</p>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Mark Complete Button */}
              {selectedDay.status === "current" && (
                <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-colors">
                  ✅ Mark Day as Complete
                </button>
              )}
            </>
          ) : (
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500">Select a day from the schedule to see details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
