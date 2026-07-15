'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Award, Clock, Sparkles, Zap, BarChart3 } from 'lucide-react';
import ProgressRing from '@/components/ui/ProgressRing';
import {
  getState,
  getWeeklyStats,
  getStreak,
  getOverallProgress,
  getBadges,
  getCompletionRate,
  getConsistencyScore,
  getHoursInvested,
  getCurrentDay,
} from '@/lib/store';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function ProgressPage() {
  const state = getState();
  const weeklyStats = getWeeklyStats(state);
  const streak = getStreak(state);
  const overallProgress = getOverallProgress(state);
  const completionRate = getCompletionRate(state);
  const consistencyScore = getConsistencyScore(state);
  const hoursInvested = getHoursInvested(state);
  const badges = getBadges(state);
  const currentDay = getCurrentDay(state);

  const metrics = [
    { icon: Award, value: `${streak}`, label: 'Day Streak', sub: 'Current streak', color: 'text-accent', bg: 'bg-accent/10' },
    { icon: BarChart3, value: `${consistencyScore}%`, label: 'Consistency', sub: 'Last 28 days', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Clock, value: `${hoursInvested}h`, label: 'Time Invested', sub: 'Total hours logged', color: 'text-success', bg: 'bg-success/10' },
    { icon: Zap, value: `${completionRate}%`, label: 'Completion', sub: 'All-time rate', color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <motion.div
      className="flex flex-col gap-5 py-6 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold text-text">Progress</h1>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="p-4 rounded-2xl bg-surface border border-border shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${metric.bg}`}>
                  <Icon size={14} className={metric.color} />
                </div>
              </div>
              <p className="text-xl font-bold text-text">{metric.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{metric.label}</p>
              <p className="text-[10px] text-text-secondary/60">{metric.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="p-4 rounded-2xl bg-surface border border-border shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <TrendingUp size={15} className="text-primary" />
          This Week
        </h2>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#8E8EA0' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  fontSize: 12,
                  background: 'var(--color-surface)',
                }}
              />
              <Bar dataKey="completed" fill="#6C5CE7" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="total" fill="#E8E8F0" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="p-4 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ProgressRing progress={overallProgress} size={90} strokeWidth={7}>
            <span className="text-lg font-bold gradient-text">{overallProgress}%</span>
          </ProgressRing>
          <span className="text-xs text-text-secondary mt-2">Overall</span>
        </motion.div>

        <motion.div
          className="p-4 rounded-2xl bg-surface border border-border shadow-sm flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProgressRing progress={Math.min(100, (currentDay / Math.max(state.roadmap?.totalDays || 1, 1)) * 100)} size={90} strokeWidth={7} color="#FF8C66">
            <span className="text-lg font-bold text-accent">Day {currentDay}</span>
          </ProgressRing>
          <span className="text-xs text-text-secondary mt-2">Journey</span>
        </motion.div>
      </div>

      <motion.div
        className="p-4 rounded-2xl bg-surface border border-border shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <Award size={15} className="text-primary" />
          Badges
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                badge.unlocked
                  ? 'border-success/30 bg-success/[0.04]'
                  : 'border-border opacity-40'
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
            >
              <motion.span
                className="text-xl"
                animate={badge.unlocked ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {badge.icon}
              </motion.span>
              <span className="text-[9px] font-medium text-text text-center leading-tight">
                {badge.title}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="p-4 rounded-2xl bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] border border-primary/[0.08] shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-primary" />
          <span className="text-sm font-semibold text-text">AI Insights</span>
        </div>
        <div className="text-xs text-text-secondary space-y-1.5">
          <p>{streak >= 3 ? `${streak}-day streak active — you're in a flow state.` : 'Building a streak starts with one task today.'}</p>
          <p>{consistencyScore >= 60 ? `Consistency score of ${consistencyScore}% — you're showing up reliably.` : 'Small daily steps build unstoppable momentum.'}</p>
          <p>{hoursInvested > 10 ? `${hoursInvested} hours invested so far — that's real progress.` : 'Every hour counts. Keep stacking.'}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
