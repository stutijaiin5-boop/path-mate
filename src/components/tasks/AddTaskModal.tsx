'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import type { Task } from '@/lib/types';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, time: number, category: Task['category']) => void;
}

const categories: { value: Task['category']; label: string }[] = [
  { value: 'study', label: 'Study' },
  { value: 'practice', label: 'Practice' },
  { value: 'networking', label: 'Networking' },
  { value: 'personal', label: 'Personal' },
];

export default function AddTaskModal({ open, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(30);
  const [category, setCategory] = useState<Task['category']>('study');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), time, category);
    setTitle('');
    setTime(30);
    setCategory('study');
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
            className="relative bg-surface rounded-t-3xl w-full max-w-md p-6 pb-10 shadow-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text">Add Task</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-border">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-text mb-2 block">Task</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What do you want to do?"
                  className="w-full p-3 rounded-xl border-2 border-border bg-bg text-text outline-none focus:border-primary transition-colors"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text mb-2 block">Estimated time: {time} min</label>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={time}
                  onChange={e => setTime(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text mb-2 block">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        category === c.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-text-secondary hover:border-primary/30'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleSubmit}
                className="w-full py-3 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!title.trim()}
              >
                <Plus size={18} />
                Add Task
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
