import { Roadmap, Phase, DayPlan, Task, CurrentLevel, Commitment } from './types';

const studyTasks: Record<string, string[]> = {
  'crack ca foundation': [
    'Study Principles & Practice of Accounting - Chapter 1',
    'Practice accounting journal entries',
    'Study Business Laws - Contract Act',
    'Solve 10 MCQ sets for Business Mathematics',
    'Study Logical Reasoning - Series & Arrangements',
    'Practice Statistics - Central Tendency',
    'Revision of Accounting standards',
    'Practice previous year CA Foundation papers',
    'Study Economics - Theory of Demand & Supply',
    'Take a mock test for Accounting',
  ],
  'improve linkedin presence': [
    'Update LinkedIn headline and summary',
    'Write a post about recent learning',
    'Connect with 5 industry professionals',
    'Research and join 2 relevant LinkedIn groups',
    'Write a recommendation for a peer',
    'Share an article with your thoughts',
    'Update profile photo and banner',
    'Create a carousel post about a topic you know',
    'Engage with 10 posts in your feed',
    'Review and update experience section',
  ],
  'learn web development': [
    'Study HTML5 semantic elements',
    'Practice CSS Flexbox layouts',
    'Build a small HTML/CSS component',
    'Learn JavaScript array methods',
    'Build a simple interactive page',
    'Study React component basics',
    'Practice building a React form',
    'Learn about APIs and fetch',
    'Build a full CRUD app feature',
    'Deploy a project to Vercel/Netlify',
  ],
};

const defaultTasks = [
  'Review yesterday\'s notes',
  'Read chapter material',
  'Practice problems',
  'Watch tutorial video and take notes',
  'Create summary flashcards',
  'Take a short quiz',
  'Discuss concepts with a study partner',
  'Write a reflection on what you learned',
  'Plan tomorrow\'s study session',
  'Review and organize study materials',
];

function getTaskPool(goal: string): string[] {
  const lower = goal.toLowerCase();
  for (const [key, tasks] of Object.entries(studyTasks)) {
    if (lower.includes(key)) return tasks;
  }
  return defaultTasks;
}

function getPhaseTitle(weekIndex: number, totalWeeks: number, currentLevel: CurrentLevel): string {
  const phases = [
    ...(currentLevel === 'almost-there'
      ? ['Rapid Revision', 'Advanced Practice', 'Mock Tests', 'Final Prep']
      : currentLevel === 'intermediate'
      ? ['Foundation Review', 'Core Concepts', 'Advanced Topics', 'Practice & Revision']
      : ['Getting Started', 'Building Foundation', 'Core Learning', 'Practice & Mastery']),
  ];

  if (totalWeeks <= 4) return phases.slice(0, totalWeeks)[weekIndex] || phases[0];
  if (totalWeeks <= 8) {
    const idx = Math.min(weekIndex, 3);
    return phases[idx];
  }
  const extended = [
    'Foundation', 'Core Concepts I', 'Core Concepts II',
    'Deep Dive', 'Advanced Topics', 'Practice & Application',
    'Mock Tests & Review', 'Final Preparation',
  ];
  const idx = Math.min(weekIndex, extended.length - 1);
  return extended[idx];
}

function getFocusForDay(day: number, totalDays: number): string {
  const ratio = day / totalDays;
  if (ratio < 0.15) return 'Getting started & building momentum';
  if (ratio < 0.3) return 'Core concepts & fundamentals';
  if (ratio < 0.5) return 'Deep dive into key areas';
  if (ratio < 0.7) return 'Applying knowledge & practice';
  if (ratio < 0.85) return 'Mock tests & review';
  return 'Final revision & confidence building';
}

export function generateRoadmap(
  goal: string,
  level: CurrentLevel,
  hoursPerDay: number,
  deadline: string,
  commitments: Commitment[]
): Roadmap {
  const startDate = new Date();
  const endDate = new Date(deadline);
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalWeeks = Math.ceil(totalDays / 7);
  const taskPool = getTaskPool(goal);

  const numSlots = Math.min(hoursPerDay, 8);
  const taskDuration = Math.max(25, Math.round((hoursPerDay * 60) / numSlots));

  const phases: Phase[] = [];
  const days: DayPlan[] = [];

  let currentDay = 0;
  for (let week = 0; week < totalWeeks; week++) {
    const weekStart = currentDay + 1;
    const daysInPhase = week + 1 < totalWeeks ? 7 : totalDays - currentDay;
    const weekEnd = currentDay + daysInPhase;

    const phaseTitle = getPhaseTitle(week, totalWeeks, level);
    phases.push({
      id: `phase_${week}`,
      title: phaseTitle,
      weekRange: `Week ${week + 1}`,
      startDay: weekStart,
      endDay: weekEnd,
      description: `Focus on ${phaseTitle.toLowerCase()}`,
      milestone: week === 0 ? 'Start your journey' : week === totalWeeks - 1 ? 'Goal completion' : `Complete ${phaseTitle}`,
    });

    for (let d = 0; d < daysInPhase; d++) {
      currentDay++;
      const date = new Date(startDate);
      date.setDate(date.getDate() + currentDay - 1);
      const dateStr = date.toISOString().split('T')[0];

      const tasks: Task[] = [];
      const shuffled = [...taskPool].sort(() => Math.random() - 0.5);

      const categories: Task['category'][] = ['study', 'study', 'practice', 'study', 'practice', 'networking', 'personal'];
      for (let i = 0; i < numSlots; i++) {
        const taskTitle = shuffled[i % shuffled.length];
        const cat = categories[i % categories.length];
        tasks.push({
          id: `day${currentDay}_task${i}`,
          title: i === 0 && d === 0
            ? `${taskTitle}`
            : i % 2 === 0
            ? `${taskTitle}`
            : `Review & practice: ${taskTitle.split('-')[0] || taskTitle}`,
          estimatedTime: taskDuration,
          category: cat,
          completed: false,
          date: dateStr,
          day: currentDay,
          phaseId: `phase_${week}`,
        });
      }

      days.push({
        day: currentDay,
        date: dateStr,
        phaseId: `phase_${week}`,
        tasks,
        completed: false,
        focus: getFocusForDay(currentDay, totalDays),
      });
    }

    currentDay = weekEnd;
  }

  // Adjust for weekends/commitments
  if (commitments.includes('job') || commitments.includes('internship') || commitments.includes('school') || commitments.includes('college')) {
    days.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      // Reduce tasks on weekends by 1 if they have weekday commitments
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (day.tasks.length > 2) {
          day.tasks = day.tasks.slice(0, Math.max(2, day.tasks.length - 1));
        }
      }
    });
  }

  if (commitments.includes('coaching') || commitments.includes('family')) {
    days.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        if (day.tasks.length > 3) {
          day.tasks = day.tasks.slice(0, day.tasks.length - 1);
        }
      }
    });
  }

  return {
    phases,
    days,
    totalDays,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}
