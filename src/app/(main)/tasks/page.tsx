'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, ClipboardList, Clock, Sparkles } from 'lucide-react';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import { getState, toggleTask, addCustomTask } from '@/lib/store';
import type { Task } from '@/lib/types';

const categoryColors: Record<string, string> = {
  study: 'bg-primary/10 text-primary',
  practice: 'bg-accent/10 text-accent',
  networking: 'bg-success/10 text-success',
  personal: 'bg-amber-500/10 text-amber-400',
};

export default function TasksPage() {
  const [, setRefresh] = useState(0);
  const [dateOffset, setDateOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [completedVisible, setCompletedVisible] = useState(true);

  const today = new Date();
  const currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() + dateOffset);
  const dateStr = currentDate.toISOString().split('T')[0];

  const state = getState();
  const dayPlan = state.roadmap?.days.find(d => d.date === dateStr);
  const tasks = dayPlan?.tasks || [];
  const completedCount = tasks.filter(t => state.taskHistory[`${dateStr}_${t.id}`]).length;
  const totalMinutes = tasks.reduce((s, t) => s + t.estimatedTime, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const pendingTasks = tasks.filter(t => !state.taskHistory[`${dateStr}_${t.id}`]);
  const doneTasks = tasks.filter(t => state.taskHistory[`${dateStr}_${t.id}`]);

  const refreshState = useCallback(() => setRefresh(prev => prev + 1), []);

  const handleToggle = (taskId: string) => {
    toggleTask(taskId, dateStr);
    refreshState();
  };

  const handleAddTask = (title: string, time: number, category: Task['category']) => {
    addCustomTask(title, time, category, dateStr);
    refreshState();
  };

  const dateDisplay = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const isToday = dateOffset === 0;

  return (
    <motion.div
      className="flex flex-col py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 mb-2">
        <h1 className="text-2xl font-bold text-text">Execution Timeline</h1>
      </div>

      <div className="flex items-center justify-between px-4 mb-5">
        <button
          onClick={() => setDateOffset(prev => prev - 1)}
          className="p-2 rounded-xl hover:bg-border/50 text-text-secondary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-text">
            {isToday ? 'Today' : dateDisplay}
          </span>
          <span className="text-[11px] text-text-secondary mt-0.5">
            {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} &middot; {tasks.length} tasks
          </span>
          {!isToday && (
            <button
              onClick={() => setDateOffset(0)}
              className="text-xs text-primary font-medium mt-0.5"
            >
              Back to today
            </button>
          )}
        </div>

        <button
          onClick={() => setDateOffset(prev => prev + 1)}
          className="p-2 rounded-xl hover:bg-border/50 text-text-secondary transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex-1 px-4">
        {tasks.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ClipboardList size={44} className="text-text-secondary" />
            <p className="text-text font-medium">No tasks scheduled</p>
            <p className="text-sm text-text-secondary text-center max-w-xs">
              Tap the + button to add your first task for this day.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence mode="popLayout">
              {pendingTasks.map((task, i) => (
                <motion.button
                  key={task.id}
                  layout
                  onClick={() => handleToggle(task.id)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border shadow-sm text-left group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 28 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary/40 transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Clock size={10} /> {task.estimatedTime} min
                      </span>
                      {task.aiNote && (
                        <span className="flex items-center gap-0.5 text-[10px] text-primary">
                          <Sparkles size={9} /> {task.aiNote}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${categoryColors[task.category] || 'bg-surface text-text-secondary'}`}>
                    {task.category}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>

            {doneTasks.length > 0 && (
              <>
                <button
                  onClick={() => setCompletedVisible(!completedVisible)}
                  className="flex items-center justify-between px-1 py-3 mt-2"
                >
                  <span className="text-xs font-medium text-text-secondary">
                    Completed ({doneTasks.length})
                  </span>
                  <motion.div
                    animate={{ rotate: completedVisible ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={14} className="text-text-secondary" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {completedVisible && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1">
                        {doneTasks.map((task, i) => (
                          <motion.button
                            key={task.id}
                            layout
                            onClick={() => handleToggle(task.id)}
                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-success/[0.03] border border-success/10 text-left"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <motion.div
                              className="shrink-0"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="9" stroke="#4CD3A5" strokeWidth="2" />
                                <motion.path
                                  d="M6 10.5L9 13.5L14 7"
                                  stroke="#4CD3A5"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              </svg>
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-text-secondary line-through">{task.title}</p>
                              <span className="text-[11px] text-text-secondary/60">{task.estimatedTime} min</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-24 right-6 z-40">
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={28} />
        </motion.button>
      </div>

      {tasks.length > 0 && (
        <div className="fixed bottom-24 left-4 right-16 z-40 pointer-events-none">
          <div className="glass rounded-2xl px-4 py-3 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text">
                {completedCount}/{tasks.length} done
              </span>
              <span className="text-xs text-text-secondary">
                {Math.round((completedCount / tasks.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )}

      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />
    </motion.div>
  );
}
