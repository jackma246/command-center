/**
 * Parser for STUDY-PLAN.md and related study files
 */

import { promises as fs } from 'fs';
import path from 'path';

const STUDY_PLAN_PATH = process.env.STUDY_PLAN_PATH || '/Users/jacma/.openclaw/workspace/study/STUDY-PLAN.md';
const STUDY_NOTES_DIR = process.env.STUDY_NOTES_DIR || '/Users/jacma/.openclaw/workspace/study/notes';

export interface StudyDay {
  day: number;
  topic: string;
  status: 'completed' | 'current' | 'upcoming';
  resources?: string[];
}

export interface StudyWeek {
  week: number;
  title: string;
  days: StudyDay[];
}

export interface StudyPlan {
  title: string;
  targetDate: string;
  weeks: StudyWeek[];
  currentWeek: number;
  currentDay: number;
}

export interface StudyNote {
  date: string;
  topic: string;
  content: string;
}

/**
 * Parse the study plan markdown file
 */
export async function parseStudyPlan(): Promise<StudyPlan> {
  try {
    const content = await fs.readFile(STUDY_PLAN_PATH, 'utf-8');
    return parseStudyPlanContent(content);
  } catch (error) {
    // Return default structure if file doesn't exist
    return getDefaultStudyPlan();
  }
}

/**
 * Parse markdown content into StudyPlan structure
 */
export function parseStudyPlanContent(content: string): StudyPlan {
  const lines = content.split('\n');
  const weeks: StudyWeek[] = [];
  let currentWeekData: StudyWeek | null = null;
  let title = 'Staff Engineer Interview Prep';
  let targetDate = 'March 2026';

  for (const line of lines) {
    // Parse title
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
    }

    // Parse week headers (## Week 1: Title)
    const weekMatch = line.match(/^##\s+Week\s+(\d+):\s*(.+)/i);
    if (weekMatch) {
      if (currentWeekData) {
        weeks.push(currentWeekData);
      }
      currentWeekData = {
        week: parseInt(weekMatch[1]),
        title: weekMatch[2].trim(),
        days: [],
      };
      continue;
    }

    // Parse day items (- Day 1: Topic or - [ ] Day 1: Topic)
    const dayMatch = line.match(/^-\s*\[?\s*([xX ])?\s*\]?\s*Day\s+(\d+):\s*(.+)/i);
    if (dayMatch && currentWeekData) {
      const isCompleted = dayMatch[1]?.toLowerCase() === 'x';
      currentWeekData.days.push({
        day: parseInt(dayMatch[2]),
        topic: dayMatch[3].trim(),
        status: isCompleted ? 'completed' : 'upcoming',
      });
    }
  }

  // Add the last week
  if (currentWeekData) {
    weeks.push(currentWeekData);
  }

  // Determine current day (first non-completed)
  let currentWeek = 1;
  let currentDay = 1;
  
  for (const week of weeks) {
    for (const day of week.days) {
      if (day.status !== 'completed') {
        currentWeek = week.week;
        currentDay = day.day;
        day.status = 'current';
        break;
      }
    }
    if (weeks[currentWeek - 1]?.days.some(d => d.status === 'current')) {
      break;
    }
  }

  return {
    title,
    targetDate,
    weeks,
    currentWeek,
    currentDay,
  };
}

/**
 * Get default study plan structure
 */
export function getDefaultStudyPlan(): StudyPlan {
  return {
    title: 'Staff Engineer Interview Prep',
    targetDate: 'March 2026',
    currentWeek: 1,
    currentDay: 1,
    weeks: [
      {
        week: 1,
        title: 'System Design Foundations',
        days: [
          { day: 1, topic: 'CAP Theorem & Consistency Models', status: 'current' },
          { day: 2, topic: 'Scaling Strategies', status: 'upcoming' },
          { day: 3, topic: 'Load Balancing & Caching', status: 'upcoming' },
          { day: 4, topic: 'Database Selection & Sharding', status: 'upcoming' },
          { day: 5, topic: 'Message Queues', status: 'upcoming' },
          { day: 6, topic: 'Practice: URL Shortener', status: 'upcoming' },
          { day: 7, topic: 'Review', status: 'upcoming' },
        ],
      },
    ],
  };
}

/**
 * Get current study topic
 */
export function getCurrentTopic(plan: StudyPlan): StudyDay | null {
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (day.status === 'current') {
        return day;
      }
    }
  }
  return null;
}

/**
 * Mark a day as completed
 */
export function markDayCompleted(plan: StudyPlan, weekNum: number, dayNum: number): StudyPlan {
  const updatedPlan = { ...plan };
  
  for (const week of updatedPlan.weeks) {
    if (week.week === weekNum) {
      for (const day of week.days) {
        if (day.day === dayNum) {
          day.status = 'completed';
        }
      }
    }
  }

  // Find and mark new current day
  let foundCurrent = false;
  for (const week of updatedPlan.weeks) {
    for (const day of week.days) {
      if (day.status === 'upcoming' && !foundCurrent) {
        day.status = 'current';
        updatedPlan.currentWeek = week.week;
        updatedPlan.currentDay = day.day;
        foundCurrent = true;
      }
    }
  }

  return updatedPlan;
}

/**
 * Save study notes for a specific date
 */
export async function saveStudyNote(note: StudyNote): Promise<void> {
  const filename = `${note.date}.md`;
  const filepath = path.join(STUDY_NOTES_DIR, filename);
  
  const content = `# Study Notes: ${note.topic}\n\nDate: ${note.date}\n\n${note.content}`;
  
  await fs.mkdir(STUDY_NOTES_DIR, { recursive: true });
  await fs.writeFile(filepath, content, 'utf-8');
}

/**
 * Load study notes for a specific date
 */
export async function loadStudyNote(date: string): Promise<StudyNote | null> {
  const filename = `${date}.md`;
  const filepath = path.join(STUDY_NOTES_DIR, filename);
  
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const topicMatch = content.match(/# Study Notes: (.+)/);
    
    return {
      date,
      topic: topicMatch?.[1] || 'Unknown',
      content: content.replace(/# Study Notes:.+\n\nDate:.+\n\n/, ''),
    };
  } catch {
    return null;
  }
}

/**
 * Calculate study progress percentage
 */
export function calculateProgress(plan: StudyPlan): number {
  let completed = 0;
  let total = 0;

  for (const week of plan.weeks) {
    for (const day of week.days) {
      total++;
      if (day.status === 'completed') {
        completed++;
      }
    }
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
