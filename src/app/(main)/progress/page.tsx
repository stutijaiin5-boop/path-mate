'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Award, CalendarDays } from 'lucide-react';
import CircularGauge from '@/components/ui/CircularGauge';
import ProgressRing from '@/components/ui/ProgressRing';
import { getState, getWeeklyStats, getStreak, getOverallProgress, getBadges, getStreakDates } from '@/lib/store';

export default function ProgressPage() {
  const state = getState();
  const weeklyStats = getWeeklyStats(state);
  const streak = getStreak(state);
  const overallProgress = getOverallProgress(state);
  const badges = getBadges(state);
  const streakDates = getStreakDates(state);

  void weeklyStats.reduce((s, w) => s + w.completed, 0);
  void weeklyStats.reduce((s, w) => s + w.total, 0);

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold text-text">Progress</h1>

      <motion.div
        className="p-5 rounded-2xl bg-surface border border-border shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          Weekly Completion
        </h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#8E8EA0' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#8E8EA0' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="completed" fill="#6C5CE7" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="total" fill="#E8E8F0" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CircularGauge
            value={streak}
            maxValue={30}
            size={110}
            label="Day Streak"
            sublabel={`Best: ${streak}`}
          />
        </motion.div>

        <motion.div
          className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ProgressRing progress={overallProgress} size={110} strokeWidth={8}>
            <span className="text-xl font-bold gradient-text">{overallProgress}%</span>
          </ProgressRing>
          <span className="text-xs text-text-secondary mt-2">Overall</span>
        </motion.div>
      </div>

      <motion.div
        className="p-5 rounded-2xl bg-surface border border-border shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          Streak Calendar
        </h2>
        <div className="flex flex-wrap gap-1">
          {streakDates.length > 0 ? (
            streakDates.slice(-90).map((date, i) => (
              <motion.div
                key={date}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: `hsl(${140 + Math.min(i, 20) * 2}, 60%, ${70 - Math.min(i, 10) * 2}%)`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.01 }}
                title={date}
              />
            ))
          ) : (
            <p className="text-xs text-text-secondary">Complete your first task to start your streak!</p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="p-5 rounded-2xl bg-surface border border-border shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <Award size={16} className="text-primary" />
          Badges & Achievements
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                badge.unlocked
                  ? 'border-success/30 bg-success/5'
                  : 'border-border bg-surface opacity-50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <motion.span
                className="text-2xl"
                animate={badge.unlocked ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {badge.icon}
              </motion.span>
              <span className="text-[10px] font-medium text-text text-center leading-tight">
                {badge.title}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
