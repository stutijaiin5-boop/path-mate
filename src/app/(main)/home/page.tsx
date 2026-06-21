'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import GoalProgressRing from '@/components/dashboard/GoalProgressRing';
import QuickStats from '@/components/dashboard/QuickStats';
import TodaysFocus from '@/components/dashboard/TodaysFocus';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import BurnoutBanner from '@/components/dashboard/BurnoutBanner';
import {
  getState,
  updateState,
  getStreak,
  getHoursLoggedToday,
  getDaysRemaining,
  getOverallProgress,
  getBurnoutStatus,
  dismissBurnout,
} from '@/lib/store';
import type { Task } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const [showBurnout, setShowBurnout] = useState(false);
  const [burnoutData, setBurnoutData] = useState({ consecutiveDays: 0 });

  const state = getState();
  const today = new Date().toISOString().split('T')[0];
  const todayPlan = state.roadmap?.days.find(d => d.date === today);

  const refreshPage = useCallback(() => setRefresh(prev => prev + 1), []);

  const progress = getOverallProgress(state);
  const streak = getStreak(state);
  const hoursLogged = getHoursLoggedToday(state);
  const daysRemaining = getDaysRemaining(state);

  useEffect(() => {
    const s = getState();
    const status = getBurnoutStatus(s);
    if (status.triggered) {
      setBurnoutData({ consecutiveDays: status.consecutiveDays });
      setShowBurnout(true);
    }
  }, [refresh]);

  const handleDismiss = () => {
    dismissBurnout();
    setShowBurnout(false);
  };

  const handleSuggestLighter = async () => {
    const s = getState();
    const day = s.roadmap?.days.find(d => d.date === today);
    if (!day) return;

    try {
      const res = await fetch('/api/groq/lighter-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: day.tasks.map(t => ({
            title: t.title,
            estimatedTime: t.estimatedTime,
            category: t.category,
          })),
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data.tasks || !Array.isArray(data.tasks)) return;

      const lighterTasks: Task[] = data.tasks.map((t: { title: string; estimatedTime: number; category: string }, i: number) => ({
        id: `${today}_lighter_${i}`,
        title: t.title,
        estimatedTime: t.estimatedTime || 20,
        category: t.category || 'personal',
        completed: false,
        date: today,
        day: day.day,
        phaseId: day.phaseId,
      }));

      const updatedRoadmap = {
        ...s.roadmap!,
        days: s.roadmap!.days.map(d =>
          d.date === today ? { ...d, tasks: lighterTasks } : d
        ),
      };

      updateState({ roadmap: updatedRoadmap });
      dismissBurnout();
      setShowBurnout(false);
      refreshPage();
    } catch {
      // silently fail
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      className="flex flex-col gap-5 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4">
        <motion.p
          className="text-sm text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {todayDate}
        </motion.p>
        <motion.h1
          className="text-2xl font-bold text-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          {greeting()}, {state.name || 'Student'} 👋
        </motion.h1>
      </div>

      <GoalProgressRing progress={progress} goal={state.goal} />

      <AnimatePresence>
        {showBurnout && (
          <BurnoutBanner
            consecutiveDays={burnoutData.consecutiveDays}
            onSuggestLighter={handleSuggestLighter}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>

      <QuickStats
        streak={streak}
        hoursLogged={hoursLogged}
        daysRemaining={daysRemaining}
      />

      <TodaysFocus
        tasks={todayPlan?.tasks || []}
        date={today}
        onToggle={refreshPage}
      />

      <motion.button
        onClick={() => router.push('/roadmap')}
        className="mx-4 py-3 rounded-2xl border-2 border-primary/20 text-primary font-semibold flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        View Full Roadmap
        <ArrowRight size={18} />
      </motion.button>

      <MotivationalQuote />
    </motion.div>
  );
}
