import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STUDY_PLAN_PATH = "/Users/jacma/.openclaw/workspace/study/STUDY-PLAN.md";

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

export async function GET() {
  try {
    let content: string;
    
    try {
      content = await fs.readFile(STUDY_PLAN_PATH, "utf-8");
    } catch {
      // Return default if file doesn't exist
      return NextResponse.json(getDefaultPlan());
    }

    const plan = parseStudyPlan(content);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Study API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch study plan" },
      { status: 500 }
    );
  }
}

function parseStudyPlan(content: string) {
  const lines = content.split("\n");
  const weeks: StudyWeek[] = [];
  let currentWeek: StudyWeek | null = null;
  let title = "Staff Engineer Interview Prep";

  for (const line of lines) {
    if (line.startsWith("# ")) {
      title = line.replace("# ", "").trim();
    }

    const weekMatch = line.match(/^##\s+Week\s+(\d+):\s*(.+)/i);
    if (weekMatch) {
      if (currentWeek) weeks.push(currentWeek);
      currentWeek = {
        week: parseInt(weekMatch[1]),
        title: weekMatch[2].trim(),
        days: [],
      };
      continue;
    }

    const dayMatch = line.match(/^-\s*\[?\s*([xX ])?\s*\]?\s*Day\s+(\d+):\s*(.+)/i);
    if (dayMatch && currentWeek) {
      const isCompleted = dayMatch[1]?.toLowerCase() === "x";
      currentWeek.days.push({
        day: parseInt(dayMatch[2]),
        topic: dayMatch[3].trim(),
        status: isCompleted ? "completed" : "upcoming",
      });
    }
  }

  if (currentWeek) weeks.push(currentWeek);

  // Mark first non-completed as current
  let currentWeekNum = 1;
  let currentDayNum = 1;
  let foundCurrent = false;

  for (const week of weeks) {
    for (const day of week.days) {
      if (day.status !== "completed" && !foundCurrent) {
        day.status = "current";
        currentWeekNum = week.week;
        currentDayNum = day.day;
        foundCurrent = true;
        break;
      }
    }
    if (foundCurrent) break;
  }

  // Calculate progress
  let completed = 0;
  let total = 0;
  for (const week of weeks) {
    for (const day of week.days) {
      total++;
      if (day.status === "completed") completed++;
    }
  }
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Get current topic
  let currentTopic = "No topic set";
  for (const week of weeks) {
    for (const day of week.days) {
      if (day.status === "current") {
        currentTopic = day.topic;
        break;
      }
    }
  }

  return {
    title,
    targetDate: "March 2026",
    currentWeek: currentWeekNum,
    currentDay: currentDayNum,
    currentTopic,
    progress,
    completed,
    total,
    weeks,
    lastUpdated: new Date().toISOString(),
  };
}

function getDefaultPlan() {
  return {
    title: "Staff Engineer Interview Prep",
    targetDate: "March 2026",
    currentWeek: 1,
    currentDay: 1,
    currentTopic: "CAP Theorem & Consistency Models",
    progress: 0,
    completed: 0,
    total: 28,
    weeks: [
      {
        week: 1,
        title: "System Design Foundations",
        days: [
          { day: 1, topic: "CAP Theorem & Consistency Models", status: "current" },
          { day: 2, topic: "Scaling Strategies", status: "upcoming" },
          { day: 3, topic: "Load Balancing & Caching", status: "upcoming" },
          { day: 4, topic: "Database Selection & Sharding", status: "upcoming" },
          { day: 5, topic: "Message Queues", status: "upcoming" },
          { day: 6, topic: "Practice: URL Shortener", status: "upcoming" },
          { day: 7, topic: "Review", status: "upcoming" },
        ],
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}
