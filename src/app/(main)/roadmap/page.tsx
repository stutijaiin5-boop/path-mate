'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, CheckCircle2, Circle, Flag, Clock } from 'lucide-react';
import { getState, getWeekGroups, toggleTask, getOverallProgress, getCurrentDay } from '@/lib/store';

export default function RoadmapPage() {
  const [, setRefresh] = useState(0);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0, 1]));
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const state = getState();
  const weekGroups = getWeekGroups(state);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentDay = getCurrentDay(state);
  const progress = getOverallProgress(state);

  const handleToggle = useCallback(() => setRefresh(prev => prev + 1), []);

  const toggleWeek = (idx: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (!state.roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] px-8 gap-4">
        <MapPin size={44} className="text-text-secondary" />
        <p className="text-text-secondary text-center">Your roadmap will appear here once you set a goal.</p>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    study: 'bg-primary/10 text-primary',
    practice: 'bg-accent/10 text-accent',
    networking: 'bg-success/10 text-success',
    personal: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <motion.div
      className="flex flex-col py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 mb-2">
        <h1 className="text-2xl font-bold text-text">Roadmap</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Day {currentDay} of {state.roadmap.totalDays} &middot; {progress}% complete
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {weekGroups.map((week, idx) => {
          const isCurrent = week.days.some(d => d.date === todayStr);
          const isCompleted = week.completedDays === week.totalDays && week.totalDays > 0;
          const isExpanded = expandedWeeks.has(idx);

          return (
            <motion.div
              key={idx}
              className={`rounded-2xl border overflow-hidden transition-all ${
                isCurrent ? 'border-primary/20 bg-primary/[0.02]' :
                isCompleted ? 'border-success/20 bg-success/[0.02]' :
                'border-border bg-surface'
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => toggleWeek(idx)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Flag size={16} className={isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-text-secondary'} />
                  <div>
                    <span className={`text-sm font-bold ${
                      isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-text'
                    }`}>
                      {week.label}
                    </span>
                    <span className="text-xs text-text-secondary ml-2">
                      {week.completedDays}/{week.totalDays} days
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Current</span>}
                  {isCompleted && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Done</span>}
                  {isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-3 flex flex-col gap-1.5">
                      {week.days.map((day, di) => {
                        const isDayToday = day.date === todayStr;
                        const isDayComplete = day.tasks.length > 0 && day.tasks.every(
                          t => getState().taskHistory[`${day.date}_${t.id}`]
                        );
                        const isDayExpanded = expandedDay === day.day;

                        return (
                          <motion.div
                            key={day.day}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: di * 0.02 }}
                          >
                            <button
                              onClick={() => setExpandedDay(isDayExpanded ? null : day.day)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                isDayToday ? 'bg-primary/5 border border-primary/15' :
                                isDayComplete ? 'bg-success/5' :
                                'hover:bg-bg'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full shrink-0 ${
                                isDayComplete ? 'bg-success' :
                                isDayToday ? 'bg-primary' :
                                'bg-border'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-medium ${
                                  isDayComplete ? 'text-success line-through' :
                                  isDayToday ? 'text-primary' :
                                  'text-text'
                                }`}>
                                  Day {day.day}
                                </span>
                                <span className="text-[10px] text-text-secondary ml-1.5">
                                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <span className="text-[10px] text-text-secondary">
                                {day.tasks.filter(t => getState().taskHistory[`${day.date}_${t.id}`]).length}/{day.tasks.length}
                              </span>
                            </button>

                            <AnimatePresence>
                              {isDayExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-6 pl-4 border-l-2 border-border flex flex-col gap-1 py-2">
                                    {day.tasks.map(task => {
                                      const taskDone = getState().taskHistory[`${day.date}_${task.id}`];
                                      return (
                                        <button
                                          key={task.id}
                                          onClick={() => { toggleTask(task.id, day.date); handleToggle(); }}
                                          className="flex items-center gap-2.5 py-2 text-left group"
                                        >
                                          {taskDone ? (
                                            <CheckCircle2 size={16} className="text-success shrink-0" />
                                          ) : (
                                            <Circle size={16} className="text-border shrink-0 group-hover:text-text-secondary/40 transition-colors" />
                                          )}
                                          <span className={`text-xs flex-1 ${taskDone ? 'text-text-secondary line-through' : 'text-text'}`}>
                                            {task.title}
                                          </span>
                                          <span className="flex items-center gap-1 text-[10px] text-text-secondary shrink-0">
                                            <Clock size={9} /> {task.estimatedTime}m
                                          </span>
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[task.category] || ''}`}>
                                            {task.category}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
