'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { toggleTask } from '@/lib/store';

interface TodaysFocusProps {
  tasks: Task[];
  date: string;
  onToggle: () => void;
}

export default function TodaysFocus({ tasks, date, onToggle }: TodaysFocusProps) {
  const handleToggle = (taskId: string) => {
    toggleTask(taskId, date);
    onToggle();
  };

  if (tasks.length === 0) {
    return (
      <div className="mx-4 p-6 rounded-2xl bg-surface border border-border shadow-card text-center">
        <p className="text-text-secondary">No tasks for today</p>
        <p className="text-sm text-text-secondary/70 mt-1">Enjoy your day off!</p>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-4 p-5 rounded-2xl bg-surface border border-border shadow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-lg font-bold text-text mb-4">Today&apos;s Focus</h3>
      <div className="flex flex-col gap-3">
        {tasks.slice(0, 4).map((task, i) => (
          <motion.button
            key={task.id}
            onClick={() => handleToggle(task.id)}
            className="flex items-center gap-3 text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {task.completed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <CheckCircle2 size={22} className="text-success shrink-0" />
              </motion.div>
            ) : (
              <Circle size={22} className="text-border shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${task.completed ? 'text-text-secondary line-through' : 'text-text'}`}>
                {task.title}
              </p>
              <span className="text-xs text-text-secondary">{task.estimatedTime} min</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              task.category === 'study' ? 'bg-primary/10 text-primary' :
              task.category === 'practice' ? 'bg-accent/10 text-accent' :
              task.category === 'networking' ? 'bg-success/10 text-success' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {task.category}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
