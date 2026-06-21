'use client';

import { motion } from 'framer-motion';
import { Flame, Clock, Calendar } from 'lucide-react';

interface QuickStatsProps {
  streak: number;
  hoursLogged: number;
  daysRemaining: number;
}

export default function QuickStats({ streak, hoursLogged, daysRemaining }: QuickStatsProps) {
  const stats = [
    { icon: Flame, value: streak, label: 'Day streak', color: 'text-accent', bg: 'bg-accent/10' },
    { icon: Clock, value: `${hoursLogged}h`, label: 'Today', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Calendar, value: daysRemaining, label: 'Days left', color: 'text-success', bg: 'bg-success/10' },
  ];

  return (
    <motion.div
      className="flex gap-3 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="flex-1 flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-surface border border-border shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <div className={`p-2 rounded-xl ${stat.bg}`}>
              <Icon size={18} className={stat.color} />
            </div>
            <motion.span
              className="text-xl font-bold text-text"
              key={stat.value}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              {stat.value}
            </motion.span>
            <span className="text-xs text-text-secondary">{stat.label}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
