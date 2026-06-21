'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, ClipboardList } from 'lucide-react';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import { getState, toggleTask, addCustomTask } from '@/lib/store';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const [, setRefresh] = useState(0);
  const [dateOffset, setDateOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const today = new Date();
  const currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() + dateOffset);
  const dateStr = currentDate.toISOString().split('T')[0];

  const state = getState();
  const dayPlan = state.roadmap?.days.find(d => d.date === dateStr);
  const tasks = dayPlan?.tasks || [];
  const completedCount = tasks.filter(t => state.taskHistory[`${dateStr}_${t.id}`]).length;

  const refreshState = useCallback(() => setRefresh(prev => prev + 1), []);

  const handleToggle = (taskId: string) => {
    toggleTask(taskId, dateStr);
    refreshState();
  };

  const handleSnooze = () => {
    // Move to next day
    if (dateOffset < 30) setDateOffset(prev => prev + 1);
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
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-text">Tasks</h1>
      </div>

      <div className="flex items-center justify-between px-4 mb-6">
        <button
          onClick={() => setDateOffset(prev => prev - 1)}
          className="p-2 rounded-xl hover:bg-border text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-text">
            {isToday ? 'Today' : dateDisplay}
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
          className="p-2 rounded-xl hover:bg-border text-text-secondary"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex-1 px-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <ClipboardList size={48} className="text-text-secondary" />
            <p className="text-text-secondary text-center">No tasks yet</p>
            <p className="text-sm text-text-secondary/70 text-center max-w-xs">
              Your roadmap is ready when you are!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm"
            >
              Add a task
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TaskCard
                    task={task}
                    completed={!!state.taskHistory[`${dateStr}_${task.id}`]}
                    onToggle={() => handleToggle(task.id)}
                    onSnooze={handleSnooze}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 right-6 z-40">
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={28} />
        </motion.button>
      </div>

      {tasks.length > 0 && (
        <div className="fixed bottom-24 left-4 right-16 z-40">
          <div className="glass rounded-2xl px-4 py-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text">
                {completedCount}/{tasks.length} tasks done
              </span>
              <span className="text-xs text-text-secondary">
                {Math.round((completedCount / tasks.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
                transition={{ duration: 0.5 }}
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
