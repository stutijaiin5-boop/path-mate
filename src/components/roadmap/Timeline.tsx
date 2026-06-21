'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import type { Roadmap } from '@/lib/types';
import { toggleTask, getState } from '@/lib/store';

type ViewMode = 'weeks' | 'full';

interface TimelineProps {
  roadmap: Roadmap;
  onToggle: () => void;
}

export default function Timeline({ roadmap, onToggle }: TimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weeks');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const phases = roadmap.phases;
  const days = roadmap.days;

  const visibleDays = viewMode === 'weeks'
    ? days.filter(d => {
        const date = new Date(d.date);
        const diffWeeks = Math.floor((date.getTime() - today.getTime()) / (7 * 86400000));
        return diffWeeks >= -2 && diffWeeks <= 4;
      })
    : days;

  const handleTaskToggle = (taskId: string, date: string) => {
    toggleTask(taskId, date);
    onToggle();
  };

  const getPhaseColor = (phaseIndex: number) => {
    const colors = ['#6C5CE7', '#FF8C66', '#4CD3A5', '#FFD93D'];
    return colors[phaseIndex % colors.length];
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="flex bg-surface rounded-2xl p-1 border border-border self-center">
        <button
          onClick={() => setViewMode('weeks')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'weeks' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary'
          }`}
        >
          Nearby
        </button>
        <button
          onClick={() => setViewMode('full')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'full' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary'
          }`}
        >
          Full Journey
        </button>
      </div>

      <div className="relative">
        {phases.map((phase) => {
          const phaseDays = visibleDays.filter(d => d.phaseId === phase.id);
          if (phaseDays.length === 0) return null;

          const phaseColor = getPhaseColor(phases.indexOf(phase));
          const completedDays = phaseDays.filter(d => {
            const stateNow = getState();
            return d.tasks.every(t => stateNow.taskHistory[`${d.date}_${t.id}`]);
          });

          return (
            <div key={phase.id} className="mb-8">
              <motion.div
                className="flex items-center gap-3 mb-4 ml-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Flag size={16} style={{ color: phaseColor }} />
                  <h3 className="font-bold text-text">{phase.weekRange}: {phase.title}</h3>
                </div>
                <span className="text-xs text-text-secondary">
                  {completedDays.length}/{phaseDays.length} days
                </span>
              </motion.div>

              <div className="relative ml-6 pl-6 border-l-2 border-border">
                {phaseDays.map((day, i) => {
                  const isToday = day.date === todayStr;
                  const isExpanded = expandedDay === day.day;
                  const completed = day.tasks.every(
                    t => getState().taskHistory[`${day.date}_${t.id}`]
                  );

                  return (
                    <motion.div
                      key={day.day}
                      className={`relative mb-3 ${isToday ? 'z-10' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className={`absolute -left-[29px] top-3 w-4 h-4 rounded-full border-2 bg-surface ${
                        completed
                          ? 'border-success bg-success'
                          : isToday
                          ? 'border-primary'
                          : 'border-border'
                      } ${isToday ? 'animate-pulse-glow shadow-lg shadow-primary/30' : ''}`}>
                        {completed && (
                          <CheckCircle2 size={16} className="text-white absolute -top-0.5 -left-0.5" />
                        )}
                      </div>

                      <motion.button
                        onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                        className={`w-full p-4 rounded-2xl text-left transition-all border ${
                          isToday
                            ? 'bg-primary/5 border-primary/20 shadow-card'
                            : completed
                            ? 'bg-success/5 border-success/20'
                            : 'bg-surface border-border hover:border-primary/20'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-sm font-semibold ${isToday ? 'text-primary' : completed ? 'text-success' : 'text-text'}`}>
                              Day {day.day}
                            </span>
                            <span className="text-xs text-text-secondary ml-2">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary">
                              {day.tasks.filter(t => getState().taskHistory[`${day.date}_${t.id}`]).length}/{day.tasks.length}
                            </span>
                            {isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
                          </div>
                        </div>

                        {!isExpanded && day.tasks.length > 0 && (
                          <p className="text-xs text-text-secondary mt-1 truncate">
                            {day.tasks[0].title}
                            {day.tasks.length > 1 ? ` +${day.tasks.length - 1} more` : ''}
                          </p>
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 ml-4 p-4 rounded-2xl bg-surface border border-border">
                              <p className="text-xs text-text-secondary mb-3 italic">{day.focus}</p>
                              <div className="flex flex-col gap-2">
                                {day.tasks.map(task => {
                                  const taskDone = getState().taskHistory[`${day.date}_${task.id}`];
                                  return (
                                    <button
                                      key={task.id}
                                      onClick={() => handleTaskToggle(task.id, day.date)}
                                      className="flex items-center gap-3 text-left"
                                    >
                                      {taskDone ? (
                                        <CheckCircle2 size={18} className="text-success shrink-0" />
                                      ) : (
                                        <Circle size={18} className="text-border shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${taskDone ? 'text-text-secondary line-through' : 'text-text'}`}>
                                          {task.title}
                                        </p>
                                        <span className="text-xs text-text-secondary">{task.estimatedTime} min</span>
                                      </div>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        task.category === 'study' ? 'bg-primary/10 text-primary' :
                                        task.category === 'practice' ? 'bg-accent/10 text-accent' :
                                        task.category === 'networking' ? 'bg-success/10 text-success' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {task.category}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
