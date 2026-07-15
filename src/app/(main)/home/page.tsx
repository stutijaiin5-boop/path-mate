'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';
import TodaysMission from '@/components/dashboard/TodaysMission';
import AiInsightCard from '@/components/dashboard/AiInsightCard';
import BurnoutBanner from '@/components/dashboard/BurnoutBanner';
import {
  getState,
  updateState,
  getStreak,
  getDaysRemaining,
  getOverallProgress,
  getBurnoutStatus,
  dismissBurnout,
  getCurrentDay,
  getProgressStatus,
  getMissedDays,
  dismissReplan,
} from '@/lib/store';
import type { Task } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const [showBurnout, setShowBurnout] = useState(false);
  const [showReplan, setShowReplan] = useState(false);
  const [burnoutData, setBurnoutData] = useState({ consecutiveDays: 0 });
  const [missedDays, setMissedDays] = useState(0);
  const [replanning, setReplanning] = useState(false);
  const [replanSummary, setReplanSummary] = useState<{
    oldEndDate: string;
    newEndDate: string;
    changes: string[];
  } | null>(null);

  const state = getState();
  const today = new Date().toISOString().split('T')[0];
  const todayPlan = state.roadmap?.days.find(d => d.date === today);

  const refreshPage = useCallback(() => setRefresh(prev => prev + 1), []);

  const daysRemaining = getDaysRemaining(state);
  const progress = getOverallProgress(state);
  const currentDay = getCurrentDay(state);
  const progressStatus = getProgressStatus(state);

  useEffect(() => {
    const s = getState();

    const burnout = getBurnoutStatus(s);
    if (burnout.triggered) {
      setBurnoutData({ consecutiveDays: burnout.consecutiveDays });
      setShowBurnout(true);
    }

    const missed = getMissedDays(s);
    const replanDismissed = s.replanDismissedAt;
    let shouldShowReplan = false;
    if (missed >= 4 && s.roadmap) {
      if (replanDismissed) {
        const diff = Math.floor(
          (new Date().getTime() - new Date(replanDismissed).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff >= 3) shouldShowReplan = true;
      } else {
        shouldShowReplan = true;
      }
    }
    setShowReplan(shouldShowReplan);
    setMissedDays(missed);
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

  const handleReplan = async () => {
    const s = getState();
    if (!s.roadmap) return;

    setReplanning(true);
    const completedTasks: { date: string; title: string }[] = [];
    const missedTasks: { date: string; title: string }[] = [];

    for (const day of s.roadmap.days) {
      for (const task of day.tasks) {
        if (s.taskHistory[`${day.date}_${task.id}`]) {
          completedTasks.push({ date: day.date, title: task.title });
        } else if (new Date(day.date) < new Date()) {
          missedTasks.push({ date: day.date, title: task.title });
        }
      }
    }

    try {
      const res = await fetch('/api/groq/replan-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: s.goal,
          originalRoadmap: s.roadmap,
          completedTasks,
          missedTasks,
          missedDays,
          hoursPerDay: s.hoursPerDay,
          deadline: s.deadline,
          currentDate: today,
          currentLevel: s.currentLevel,
        }),
      });

      if (!res.ok) throw new Error('Replan failed');
      const data = await res.json();

      updateState({ roadmap: data.roadmap });

      setReplanSummary({
        oldEndDate: s.roadmap!.endDate,
        newEndDate: data.roadmap.endDate,
        changes: data.changes || [],
      });

      dismissReplan();
      setShowReplan(false);
      setReplanning(false);
      refreshPage();
    } catch {
      setReplanning(false);
    }
  };

  const handleDismissReplan = () => {
    dismissReplan();
    setShowReplan(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statusColor = {
    ahead: 'text-success',
    'on-track': 'text-primary',
    behind: 'text-warning',
    critical: 'text-danger',
  }[progressStatus.variant];

  return (
    <motion.div
      className="flex flex-col gap-5 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-xs text-text-secondary font-medium tracking-wide uppercase">
            Day {currentDay} &middot; {daysRemaining} days remaining
          </p>
        </motion.div>
        <motion.h1
          className="text-2xl font-bold text-text mt-0.5"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {greeting()}, {state.name || 'Student'}
        </motion.h1>
      </div>

      <motion.div
        className="mx-4 p-5 rounded-2xl bg-gradient-to-br from-primary/[0.06] to-accent/[0.04] border border-primary/[0.08] shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary/70 font-medium uppercase tracking-wider mb-1">Goal</p>
            <p className="text-lg font-bold text-text leading-snug">{state.goal || 'No goal set'}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className={`text-sm font-bold ${statusColor}`}>{progressStatus.label}</p>
            <p className="text-xs text-text-secondary mt-0.5">{progress}% complete</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showReplan && (
          <motion.div
            className="mx-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/20 shadow-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-sm text-text font-medium">
              Looks like life got busy. You&apos;ve missed the last <span className="text-amber-400 font-bold">{missedDays} days</span>.
              Would you like me to rebuild your roadmap?
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReplan}
                disabled={replanning}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {replanning ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Rebuilding...
                  </>
                ) : (
                  'Rebuild My Plan'
                )}
              </button>
              <button
                onClick={handleDismissReplan}
                className="py-2.5 px-4 rounded-xl bg-surface/50 text-text-secondary text-sm font-medium hover:bg-surface/80 transition-colors border border-border/50"
              >
                Not now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBurnout && (
          <BurnoutBanner
            consecutiveDays={burnoutData.consecutiveDays}
            onSuggestLighter={handleSuggestLighter}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>

      {todayPlan ? (
        <TodaysMission
          tasks={todayPlan.tasks}
          date={today}
          onToggle={refreshPage}
        />
      ) : (
        <motion.div
          className="mx-4 p-6 rounded-2xl bg-surface border border-border shadow-card text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-text font-medium">You&apos;re fully caught up.</p>
          <p className="text-sm text-text-secondary mt-1">Want to get ahead?</p>
          <button
            onClick={() => router.push('/tasks')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
          >
            Plan tomorrow
          </button>
        </motion.div>
      )}

      <AiInsightCard state={state} />

      <motion.button
        onClick={() => router.push('/roadmap')}
        className="mx-4 py-3 rounded-2xl border-2 border-primary/15 text-primary font-semibold flex items-center justify-center gap-2 text-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        View Full Roadmap
        <ArrowRight size={16} />
      </motion.button>

      <AnimatePresence>
        {replanSummary && (
          <motion.div
            className="mx-4 p-5 rounded-2xl bg-gradient-to-br from-success/10 to-primary/10 border border-success/20 shadow-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <p className="text-sm font-bold text-success mb-1">Roadmap Rebuilt!</p>
            <p className="text-xs text-text-secondary">
              {replanSummary.oldEndDate !== replanSummary.newEndDate ? (
                <>Deadline moved from <span className="text-text">{replanSummary.oldEndDate}</span> to <span className="text-text">{replanSummary.newEndDate}</span></>
              ) : (
                <>Deadline unchanged — you&apos;re still on track!</>
              )}
            </p>
            {replanSummary.changes.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1">
                {replanSummary.changes.slice(0, 3).map((change, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-success mt-0.5">&bull;</span>
                    {change}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setReplanSummary(null)}
              className="mt-3 text-xs text-primary font-medium"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
