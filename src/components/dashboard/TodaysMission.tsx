'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Zap } from 'lucide-react';
import type { Task } from '@/lib/types';
import { toggleTask } from '@/lib/store';

interface TodaysMissionProps {
  tasks: Task[];
  date: string;
  onToggle: () => void;
}

const categoryColors: Record<string, string> = {
  study: 'bg-primary/10 text-primary',
  practice: 'bg-accent/10 text-accent',
  networking: 'bg-success/10 text-success',
  personal: 'bg-amber-500/10 text-amber-400',
};

export default function TodaysMission({ tasks, date, onToggle }: TodaysMissionProps) {
  const totalMinutes = tasks.reduce((s, t) => s + t.estimatedTime, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const handleToggle = (taskId: string) => {
    toggleTask(taskId, date);
    onToggle();
  };

  return (
    <motion.div
      className="mx-4 p-5 rounded-2xl bg-surface border border-border shadow-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text">Today&apos;s Mission</h2>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock size={14} />
          <span>{timeStr}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.slice(0, 6).map((task, i) => (
          <motion.button
            key={task.id}
            onClick={() => handleToggle(task.id)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition-colors text-left group"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="shrink-0">
              {task.completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CheckCircle2 size={22} className="text-success" />
                </motion.div>
              ) : (
                <Circle size={22} className="text-border group-hover:text-text-secondary/40 transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${task.completed ? 'text-text-secondary line-through' : 'text-text'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-text-secondary">{task.estimatedTime} min</span>
                {task.priority === 'high' && (
                  <span className="flex items-center gap-0.5 text-[10px] text-accent">
                    <Zap size={10} /> Priority
                  </span>
                )}
                {task.aiNote && (
                  <span className="text-[10px] text-primary/70">{task.aiNote}</span>
                )}
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${categoryColors[task.category] || 'bg-surface text-text-secondary'}`}>
              {task.category}
            </span>
          </motion.button>
        ))}
      </div>

      <motion.button
        className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Zap size={16} />
        Start Focus Session
      </motion.button>
    </motion.div>
  );
}
