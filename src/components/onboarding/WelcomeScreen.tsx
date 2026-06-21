'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MicButton from '@/components/ui/MicButton';

interface WelcomeScreenProps {
  onContinue: (goal: string) => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const [goal, setGoal] = useState('');

  const handleVoiceResult = (text: string) => {
    setGoal(prev => prev + ' ' + text);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-between min-h-dvh px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <motion.div
          className="relative w-48 h-48"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6C5CE7" />
                <stop offset="100%" stopColor="#FF8C66" />
              </linearGradient>
            </defs>
            <path
              d="M20 180 L60 90 L100 130 L140 60 L180 180Z"
              fill="none"
              stroke="url(#mountainGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              d="M60 90 L60 180"
              fill="none"
              stroke="#E8E8F0"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.circle
              cx="140"
              cy="40"
              r="10"
              fill="none"
              stroke="#4CD3A5"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 1, delay: 1 }}
            />
            <motion.text
              x="140"
              y="44"
              textAnchor="middle"
              fontSize="14"
              fill="#4CD3A5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              🚩
            </motion.text>
            <motion.circle
              cx="35"
              cy="160"
              r="6"
              fill="#6C5CE7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            />
          </svg>
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-text text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          What&apos;s your goal?
        </motion.h1>

        <motion.p
          className="text-text-secondary text-center max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Tell me what you want to achieve, and I&apos;ll build a personalized roadmap for you
        </motion.p>

        <motion.div
          className="w-full max-w-sm relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 bg-surface rounded-2xl border border-border px-4 py-3 shadow-card">
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Crack CA Foundation in 6 months"
              className="flex-1 bg-transparent text-text placeholder-text-secondary text-base outline-none"
              onKeyDown={e => e.key === 'Enter' && goal.trim() && onContinue(goal.trim())}
            />
            <MicButton onResult={handleVoiceResult} />
          </div>
        </motion.div>
      </div>

      <motion.button
        className="w-full max-w-sm py-4 rounded-2xl bg-primary text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-40 disabled:shadow-none"
        onClick={() => onContinue(goal.trim())}
        disabled={!goal.trim()}
        whileHover={goal.trim() ? { scale: 1.02 } : {}}
        whileTap={goal.trim() ? { scale: 0.98 } : {}}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Continue
        <ArrowRight size={20} />
      </motion.button>
    </motion.div>
  );
}
