"use client";

const tracks = [
  {
    id: 1,
    title: "Faceless YouTube",
    emoji: "📺",
    status: "active",
    description: "Historical Stories channel",
    progress: 15,
    lastUpdate: "First script written (Library of Alexandria)",
    nextStep: "Record voiceover, create visuals",
    notes: "Niche selected, first script complete. Need to set up channel and create first video.",
  },
  {
    id: 2,
    title: "Print on Demand",
    emoji: "🎨",
    status: "active",
    description: "Etsy, Redbubble, Amazon Merch",
    progress: 20,
    lastUpdate: "15 design concepts ready",
    nextStep: "Create designs in Canva/AI, upload to platforms",
    notes: "Design concepts brainstormed. Need to actually create the designs and list them.",
  },
  {
    id: 3,
    title: "Solana Trading Bot",
    emoji: "🐋",
    status: "active",
    description: "Automated memecoin trading",
    progress: 75,
    lastUpdate: "Day 2: +$175 profit → now +$75 all-time",
    nextStep: "Monitor, tune parameters, dashboard deployment",
    notes: "Bot is live and profitable. Tiered exits, whale tracking, volume detection all working.",
  },
];

const ideas = [
  { title: "AI Writing Tool SaaS", status: "backlog" },
  { title: "Chrome Extension for Productivity", status: "backlog" },
  { title: "Discord Bot Monetization", status: "backlog" },
  { title: "Course on System Design", status: "backlog" },
];

export default function IdeasPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">💡 Ideas & Tracks</h1>
        <p className="text-gray-500">Active projects and future opportunities</p>
      </div>

      {/* Active Tracks */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">🚀 Active Tracks</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{track.emoji}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    track.status === "active"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {track.status}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{track.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{track.description}</p>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{track.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${track.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Last:</span>{" "}
                  <span className="text-gray-300">{track.lastUpdate}</span>
                </div>
                <div>
                  <span className="text-gray-500">Next:</span>{" "}
                  <span className="text-blue-400">{track.nextStep}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backlog */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">📋 Backlog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ideas.map((idea, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
            >
              <span>{idea.title}</span>
              <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                {idea.status}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2 border border-dashed border-gray-700 rounded-lg text-gray-500 hover:border-gray-600 hover:text-gray-400 transition-colors">
          + Add New Idea
        </button>
      </div>

      {/* Philosophy */}
      <div className="mt-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-5 border border-purple-800/50">
        <h2 className="text-lg font-semibold mb-2">🎯 The Mission</h2>
        <p className="text-gray-300">
          <strong>Make money together.</strong> Portfolio approach: quick flips for cash flow,
          passive income streams, bigger plays building in background.
        </p>
        <p className="text-gray-400 mt-2 text-sm">
          Philosophy: Build once, earn forever. Volume plays. Maximize Clack leverage.
        </p>
      </div>
    </div>
  );
}
