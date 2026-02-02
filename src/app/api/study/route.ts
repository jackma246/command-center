import { NextResponse } from "next/server";

interface StudyDay {
  day: number;
  topic: string;
  status: "completed" | "current" | "upcoming";
  notes?: string;
  details?: {
    keyConcepts: string[];
    resources: { type: string; title: string; url?: string; chapter?: string }[];
    practiceProblems: string[];
    timeEstimate: string;
    learningObjectives: string[];
  };
}

interface StudyWeek {
  week: number;
  title: string;
  days: StudyDay[];
}

const WEEK_TITLES: Record<number, string> = {
  1: "System Design Foundations",
  2: "Distributed Systems Deep Dive",
  3: "Data-Intensive Applications",
  4: "Staff-Level Prep & Mock Interviews",
};

export async function GET() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (DATABASE_URL) {
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });

      const res = await pool.query(`
        SELECT week, day, topic, status, notes, details 
        FROM study_progress 
        ORDER BY week, day
      `);

      await pool.end();

      // Group by week
      const weeksMap = new Map<number, StudyDay[]>();
      for (const row of res.rows) {
        if (!weeksMap.has(row.week)) {
          weeksMap.set(row.week, []);
        }
        weeksMap.get(row.week)!.push({
          day: row.day,
          topic: row.topic,
          status: row.status,
          notes: row.notes,
          details: row.details,
        });
      }

      const weeks: StudyWeek[] = [];
      for (const [weekNum, days] of weeksMap) {
        weeks.push({
          week: weekNum,
          title: WEEK_TITLES[weekNum] || `Week ${weekNum}`,
          days,
        });
      }

      // Find current
      let currentWeek = 1;
      let currentDay = 1;
      let currentTopic = "";
      let completed = 0;
      let total = 0;

      for (const week of weeks) {
        for (const day of week.days) {
          total++;
          if (day.status === "completed") completed++;
          if (day.status === "current") {
            currentWeek = week.week;
            currentDay = day.day;
            currentTopic = day.topic;
          }
        }
      }

      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return NextResponse.json({
        title: "Staff Engineer Interview Prep",
        targetDate: "March 2026",
        currentWeek,
        currentDay,
        currentTopic: currentTopic || "No topic set",
        progress,
        completed,
        total,
        weeks,
        lastUpdated: new Date().toISOString(),
        source: "database",
      });
    } catch (error) {
      console.error("DB error:", error);
      // Fall through to default
    }
  }

  // Fallback to hardcoded plan
  return NextResponse.json(getDefaultPlan());
}

// Mark a day as completed
export async function POST(request: Request) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { week, day, action, notes } = await request.json();
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    if (action === "complete") {
      // Mark current day as completed
      await pool.query(`
        UPDATE study_progress SET status = 'completed', completed_at = NOW()
        WHERE week = $1 AND day = $2
      `, [week, day]);

      // Find and mark next day as current
      const nextDay = await pool.query(`
        SELECT week, day FROM study_progress 
        WHERE status = 'upcoming' 
        ORDER BY week, day LIMIT 1
      `);

      if (nextDay.rows.length > 0) {
        await pool.query(`
          UPDATE study_progress SET status = 'current'
          WHERE week = $1 AND day = $2
        `, [nextDay.rows[0].week, nextDay.rows[0].day]);
      }
    } else if (action === "save_notes") {
      await pool.query(`
        UPDATE study_progress SET notes = $3, updated_at = NOW()
        WHERE week = $1 AND day = $2
      `, [week, day, notes]);
    }

    await pool.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating study progress:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
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
          { day: 2, topic: "Scaling Strategies (Horizontal vs Vertical)", status: "upcoming" },
          { day: 3, topic: "Load Balancing & Caching", status: "upcoming" },
          { day: 4, topic: "Database Selection & Sharding", status: "upcoming" },
          { day: 5, topic: "Message Queues & Event-Driven Architecture", status: "upcoming" },
          { day: 6, topic: "Practice: Design URL Shortener", status: "upcoming" },
          { day: 7, topic: "Review & Catch Up", status: "upcoming" },
        ],
      },
      {
        week: 2,
        title: "Distributed Systems Deep Dive",
        days: [
          { day: 1, topic: "Consensus Algorithms (Paxos, Raft)", status: "upcoming" },
          { day: 2, topic: "Replication Strategies", status: "upcoming" },
          { day: 3, topic: "Partitioning & Consistent Hashing", status: "upcoming" },
          { day: 4, topic: "Distributed Transactions", status: "upcoming" },
          { day: 5, topic: "Practice: Design Distributed Cache", status: "upcoming" },
          { day: 6, topic: "Practice: Design Rate Limiter", status: "upcoming" },
          { day: 7, topic: "Review & Catch Up", status: "upcoming" },
        ],
      },
      {
        week: 3,
        title: "Data-Intensive Applications",
        days: [
          { day: 1, topic: "Storage Engines & Indexes", status: "upcoming" },
          { day: 2, topic: "Stream Processing", status: "upcoming" },
          { day: 3, topic: "Batch Processing", status: "upcoming" },
          { day: 4, topic: "Practice: Design Twitter Feed", status: "upcoming" },
          { day: 5, topic: "Practice: Design Search System", status: "upcoming" },
          { day: 6, topic: "Practice: Design Notification System", status: "upcoming" },
          { day: 7, topic: "Review & Catch Up", status: "upcoming" },
        ],
      },
      {
        week: 4,
        title: "Staff-Level Prep & Mock Interviews",
        days: [
          { day: 1, topic: "Leadership & Influence Stories", status: "upcoming" },
          { day: 2, topic: "Cross-Team Project Examples", status: "upcoming" },
          { day: 3, topic: "Mock System Design: Payment System", status: "upcoming" },
          { day: 4, topic: "Mock System Design: Video Streaming", status: "upcoming" },
          { day: 5, topic: "Mock Behavioral Interview", status: "upcoming" },
          { day: 6, topic: "Final Review", status: "upcoming" },
          { day: 7, topic: "Rest & Mental Prep", status: "upcoming" },
        ],
      },
    ],
    lastUpdated: new Date().toISOString(),
    source: "fallback",
  };
}
