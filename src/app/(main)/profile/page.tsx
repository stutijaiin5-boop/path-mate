'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Moon,
  Sun,
  RefreshCw,
  LogOut,
  Target,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { getState, updateState, reGenerateRoadmap } from '@/lib/store';
import { generateRoadmap } from '@/lib/roadmap-generator';
import type { CurrentLevel, Commitment } from '@/lib/types';

const commitmentOptions: { value: Commitment; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'college', label: 'College' },
  { value: 'job', label: 'Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'coaching', label: 'Coaching classes' },
  { value: 'family', label: 'Family responsibilities' },
];

export default function ProfilePage() {
  const router = useRouter();
  const state = getState();
  const [name, setName] = useState(state.name);
  const [goal, setGoal] = useState(state.goal);
  const [deadline, setDeadline] = useState(state.deadline);
  const [hoursPerDay, setHoursPerDay] = useState(state.hoursPerDay);
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>(state.currentLevel);
  const [commitments, setCommitments] = useState<Commitment[]>(state.commitments);
  const [darkMode, setDarkMode] = useState(state.darkMode);
  const [notifications, setNotifications] = useState(state.notifications);
  const [saved, setSaved] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = () => {
    updateState({
      name,
      goal,
      deadline,
      hoursPerDay,
      currentLevel,
      commitments,
      darkMode,
      notifications,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRegenerate = () => {
    if (!goal || !deadline) return;
    setRegenerating(true);
    setTimeout(() => {
      const roadmap = generateRoadmap(goal, currentLevel, hoursPerDay, deadline, commitments);
      reGenerateRoadmap(roadmap);
      setRegenerating(false);
    }, 1500);
  };

  const handleReset = () => {
    updateState({ onboardingComplete: false, roadmap: null, taskHistory: {} });
    router.push('/');
  };

  const toggleCommitment = (c: Commitment) => {
    setCommitments(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold text-text">Profile</h1>

      <motion.div
        className="p-5 rounded-2xl bg-surface border border-border shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <User size={16} className="text-primary" />
          Personal Info
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-border bg-bg text-text outline-none focus:border-primary transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block flex items-center gap-1">
              <Target size={12} /> Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-border bg-bg text-text outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block flex items-center gap-1">
                <CalendarDays size={12} /> Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-border bg-bg text-text outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block flex items-center gap-1">
                <Clock size={12} /> Hours/day
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={hoursPerDay}
                onChange={e => setHoursPerDay(Number(e.target.value))}
                className="w-full p-3 rounded-xl border-2 border-border bg-bg text-text outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="p-5 rounded-2xl bg-surface border border-border shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-sm font-semibold text-text mb-4">Current Level</h2>
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'almost-there'] as CurrentLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setCurrentLevel(level)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                currentLevel === level
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary'
              }`}
            >
              {level === 'beginner' ? '🌱 Beginner' : level === 'intermediate' ? '🌿 Intermediate' : '🌳 Almost there'}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="p-5 rounded-2xl bg-surface border border-border shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-text mb-4">Commitments</h2>
        <div className="flex flex-wrap gap-2">
          {commitmentOptions.map(c => (
            <button
              key={c.value}
              onClick={() => toggleCommitment(c.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium border-2 transition-all ${
                commitments.includes(c.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="p-5 rounded-2xl bg-surface border border-border shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-sm font-semibold text-text mb-4">Preferences</h2>

        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-bg cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-text-secondary" />
              <span className="text-sm text-text">Daily reminders</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-primary' : 'bg-border'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: notifications ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            </button>
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-bg cursor-pointer">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={18} className="text-text-secondary" /> : <Sun size={18} className="text-text-secondary" />}
              <span className="text-sm text-text">Dark mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                darkMode ? 'bg-primary' : 'bg-border'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: darkMode ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            </button>
          </label>
        </div>
      </motion.div>

      <motion.button
        onClick={handleSave}
        className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold shadow-lg shadow-primary/30"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {saved ? '✓ Saved!' : 'Save Changes'}
      </motion.button>

      <motion.button
        onClick={handleRegenerate}
        disabled={regenerating}
        className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-accent/30 disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <RefreshCw size={18} className={regenerating ? 'animate-spin' : ''} />
        {regenerating ? 'Regenerating...' : 'Re-generate Roadmap'}
      </motion.button>

      <motion.button
        onClick={handleReset}
        className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 font-medium flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <LogOut size={16} />
        Reset & Start Over
      </motion.button>
    </motion.div>
  );
}
