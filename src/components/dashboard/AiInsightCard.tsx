'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { UserState } from '@/lib/types';
import { getStreak, getConsistencyScore, getHoursLoggedToday } from '@/lib/store';

interface AiInsightCardProps {
  state: UserState;
}

export default function AiInsightCard({ state }: AiInsightCardProps) {
  const streak = getStreak(state);
  const consistency = getConsistencyScore(state);
  const hoursToday = getHoursLoggedToday(state);

  let insight = '';

  if (!state.roadmap) {
    insight = 'Set a goal and start your journey to get personalized insights.';
  } else if (streak >= 7 && consistency >= 80) {
    insight = "You're on fire! Your consistency is in the top tier. Keep showing up — momentum is your superpower.";
  } else if (hoursToday > 3) {
    insight = "You've already logged meaningful time today. Great focus — remember to take short breaks to sustain energy.";
  } else if (consistency >= 60) {
    insight = 'You usually complete deep work before noon. Consider tackling your hardest task first thing tomorrow.';
  } else if (streak >= 3) {
    insight = `${streak}-day streak active! Small daily wins compound faster than you think. Stay steady.`;
  } else if (streak === 0 && state.roadmap) {
    insight = 'Every expert was once a beginner. Start today — even one task builds the habit.';
  } else {
    insight = 'You\'re building something meaningful. Trust the process, one day at a time.';
  }

  return (
    <motion.div
      className="mx-4 p-4 rounded-2xl bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] border border-primary/[0.08] shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-secondary/80 font-medium mb-0.5">AI Coach</p>
          <p className="text-sm text-text leading-relaxed">{insight}</p>
        </div>
      </div>
    </motion.div>
  );
}
