import {
  parseStudyPlanContent,
  getDefaultStudyPlan,
  getCurrentTopic,
  markDayCompleted,
  calculateProgress,
  type StudyPlan,
} from '@/lib/study-parser';

describe('study-parser', () => {
  describe('parseStudyPlanContent', () => {
    it('should parse a simple study plan', () => {
      const content = `# Staff Interview Prep

## Week 1: System Design

- Day 1: CAP Theorem
- Day 2: Scaling Strategies
- Day 3: Load Balancing
`;

      const result = parseStudyPlanContent(content);

      expect(result.title).toBe('Staff Interview Prep');
      expect(result.weeks).toHaveLength(1);
      expect(result.weeks[0].week).toBe(1);
      expect(result.weeks[0].title).toBe('System Design');
      expect(result.weeks[0].days).toHaveLength(3);
      expect(result.weeks[0].days[0].topic).toBe('CAP Theorem');
    });

    it('should parse multiple weeks', () => {
      const content = `# Prep Plan

## Week 1: Foundations

- Day 1: Topic A
- Day 2: Topic B

## Week 2: Advanced

- Day 1: Topic C
- Day 2: Topic D
`;

      const result = parseStudyPlanContent(content);

      expect(result.weeks).toHaveLength(2);
      expect(result.weeks[0].week).toBe(1);
      expect(result.weeks[1].week).toBe(2);
      expect(result.weeks[1].title).toBe('Advanced');
    });

    it('should mark completed days from checkboxes', () => {
      const content = `# Plan

## Week 1: Test

- [x] Day 1: Completed Topic
- [ ] Day 2: Not Started
- Day 3: Also Not Started
`;

      const result = parseStudyPlanContent(content);

      expect(result.weeks[0].days[0].status).toBe('completed');
      expect(result.weeks[0].days[1].status).toBe('current'); // First non-completed becomes current
      expect(result.weeks[0].days[2].status).toBe('upcoming');
    });

    it('should set first non-completed day as current', () => {
      const content = `# Plan

## Week 1: Test

- [x] Day 1: Done
- [x] Day 2: Also Done
- Day 3: Current
- Day 4: Upcoming
`;

      const result = parseStudyPlanContent(content);

      expect(result.currentWeek).toBe(1);
      expect(result.currentDay).toBe(3);
      expect(result.weeks[0].days[2].status).toBe('current');
    });

    it('should handle empty content', () => {
      const result = parseStudyPlanContent('');

      expect(result.title).toBe('Staff Engineer Interview Prep');
      expect(result.weeks).toHaveLength(0);
    });
  });

  describe('getDefaultStudyPlan', () => {
    it('should return a valid default plan', () => {
      const plan = getDefaultStudyPlan();

      expect(plan.title).toBe('Staff Engineer Interview Prep');
      expect(plan.targetDate).toBe('March 2026');
      expect(plan.weeks).toHaveLength(1);
      expect(plan.currentWeek).toBe(1);
      expect(plan.currentDay).toBe(1);
    });

    it('should have first day as current', () => {
      const plan = getDefaultStudyPlan();

      expect(plan.weeks[0].days[0].status).toBe('current');
      expect(plan.weeks[0].days[1].status).toBe('upcoming');
    });
  });

  describe('getCurrentTopic', () => {
    it('should return the current topic', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 2,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'completed' },
              { day: 2, topic: 'Topic 2', status: 'current' },
              { day: 3, topic: 'Topic 3', status: 'upcoming' },
            ],
          },
        ],
      };

      const current = getCurrentTopic(plan);

      expect(current).not.toBeNull();
      expect(current?.topic).toBe('Topic 2');
      expect(current?.day).toBe(2);
    });

    it('should return null if no current topic', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 1,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'completed' },
              { day: 2, topic: 'Topic 2', status: 'completed' },
            ],
          },
        ],
      };

      const current = getCurrentTopic(plan);

      expect(current).toBeNull();
    });
  });

  describe('markDayCompleted', () => {
    it('should mark the specified day as completed', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 1,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'current' },
              { day: 2, topic: 'Topic 2', status: 'upcoming' },
            ],
          },
        ],
      };

      const updated = markDayCompleted(plan, 1, 1);

      expect(updated.weeks[0].days[0].status).toBe('completed');
    });

    it('should set the next day as current', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 1,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'current' },
              { day: 2, topic: 'Topic 2', status: 'upcoming' },
              { day: 3, topic: 'Topic 3', status: 'upcoming' },
            ],
          },
        ],
      };

      const updated = markDayCompleted(plan, 1, 1);

      expect(updated.weeks[0].days[1].status).toBe('current');
      expect(updated.currentDay).toBe(2);
    });

    it('should move to next week when current week is done', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 2,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'completed' },
              { day: 2, topic: 'Topic 2', status: 'current' },
            ],
          },
          {
            week: 2,
            title: 'Week 2',
            days: [
              { day: 1, topic: 'Topic 3', status: 'upcoming' },
            ],
          },
        ],
      };

      const updated = markDayCompleted(plan, 1, 2);

      expect(updated.currentWeek).toBe(2);
      expect(updated.currentDay).toBe(1);
      expect(updated.weeks[1].days[0].status).toBe('current');
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for no completed days', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 1,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'current' },
              { day: 2, topic: 'Topic 2', status: 'upcoming' },
            ],
          },
        ],
      };

      expect(calculateProgress(plan)).toBe(0);
    });

    it('should calculate correct percentage', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 3,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'completed' },
              { day: 2, topic: 'Topic 2', status: 'completed' },
              { day: 3, topic: 'Topic 3', status: 'current' },
              { day: 4, topic: 'Topic 4', status: 'upcoming' },
            ],
          },
        ],
      };

      expect(calculateProgress(plan)).toBe(50); // 2 of 4 = 50%
    });

    it('should return 100 for all completed', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 1,
        weeks: [
          {
            week: 1,
            title: 'Week 1',
            days: [
              { day: 1, topic: 'Topic 1', status: 'completed' },
              { day: 2, topic: 'Topic 2', status: 'completed' },
            ],
          },
        ],
      };

      expect(calculateProgress(plan)).toBe(100);
    });

    it('should handle empty plan', () => {
      const plan: StudyPlan = {
        title: 'Test',
        targetDate: 'March 2026',
        currentWeek: 1,
        currentDay: 1,
        weeks: [],
      };

      expect(calculateProgress(plan)).toBe(0);
    });
  });
});
