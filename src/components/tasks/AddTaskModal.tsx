'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronUp, Clock, Repeat } from 'lucide-react';
import type { Task } from '@/lib/types';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, time: number, category: Task['category']) => void;
}

const categories: { value: Task['category']; label: string; icon: string }[] = [
  { value: 'study', label: 'Study', icon: '📚' },
  { value: 'practice', label: 'Practice', icon: '✏️' },
  { value: 'networking', label: 'Network', icon: '🤝' },
  { value: 'personal', label: 'Personal', icon: '🧘' },
];

export default function AddTaskModal({ open, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(30);
  const [category, setCategory] = useState<Task['category']>('study');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), time, category);
    setTitle('');
    setTime(30);
    setCategory('study');
    setShowAdvanced(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative bg-surface rounded-t-3xl w-full max-w-md p-6 pb-8 shadow-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text">Add Task</h2>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-border/50 transition-colors">
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">Task Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Review Chapter 4 notes"
                  className="w-full p-3.5 rounded-xl border-2 border-border bg-bg text-text outline-none focus:border-primary transition-colors text-sm"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary mb-2 block uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium border-2 transition-all ${
                        category === c.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-text-secondary hover:border-primary/20'
                      }`}
                    >
                      <span className="text-lg">{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Duration: {time} min
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={time}
                  onChange={e => setTime(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                  <span>5 min</span>
                  <span>120 min</span>
                </div>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs text-text-secondary font-medium py-1"
              >
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Advanced options
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-border">
                      <Repeat size={16} className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">Repeat</span>
                      <select className="ml-auto text-sm text-text bg-transparent outline-none rounded-lg p-1.5 border border-border">
                        <option>Does not repeat</option>
                        <option>Daily</option>
                        <option>Weekdays</option>
                        <option>Weekly</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-primary/20 text-sm"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={!title.trim()}
              >
                <Plus size={18} />
                Add to Timeline
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
