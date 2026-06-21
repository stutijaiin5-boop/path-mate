'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  completed: boolean;
  onToggle: () => void;
  onSnooze: () => void;
}

export default function TaskCard({ task, completed, onToggle, onSnooze }: TaskCardProps) {
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);

  const categoryColors: Record<string, { bg: string; text: string }> = {
    study: { bg: 'bg-primary/10', text: 'text-primary' },
    practice: { bg: 'bg-accent/10', text: 'text-accent' },
    networking: { bg: 'bg-success/10', text: 'text-success' },
    personal: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  };

  const catColor = categoryColors[task.category] || categoryColors.study;

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      setSwiped('right');
      setTimeout(() => {
        onToggle();
        setSwiped(null);
      }, 300);
    } else if (info.offset.x < -100) {
      setSwiped('left');
      setTimeout(() => {
        onSnooze();
        setSwiped(null);
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {!swiped && (
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <motion.div
            className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
          >
            <div className="flex items-center gap-3 p-4">
              <motion.button
                onClick={onToggle}
                whileTap={{ scale: 0.8 }}
              >
                {completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    <CheckCircle2 size={24} className="text-success" />
                  </motion.div>
                ) : (
                  <Circle size={24} className="text-border" />
                )}
              </motion.button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${completed ? 'text-text-secondary line-through' : 'text-text'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={12} className="text-text-secondary" />
                  <span className="text-xs text-text-secondary">{task.estimatedTime} min</span>
                </div>
              </div>

              <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${catColor.bg} ${catColor.text}`}>
                {task.category}
              </span>
            </div>
          </motion.div>

          <div className="absolute inset-y-0 -left-2 flex items-center pointer-events-none">
            <div className="bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0">Complete</div>
          </div>
          <div className="absolute inset-y-0 -right-2 flex items-center pointer-events-none">
            <div className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0">Snooze</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
