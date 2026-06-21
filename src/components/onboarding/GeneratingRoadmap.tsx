'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Map, Target, Sparkles } from 'lucide-react';

interface GeneratingRoadmapProps {
  onComplete: () => void;
}

const messages = [
  { text: 'Analyzing your goal...', icon: Target },
  { text: 'Mapping out your days...', icon: Map },
  { text: 'Building your path...', icon: Compass },
  { text: 'Almost there...', icon: Sparkles },
];

export default function GeneratingRoadmap({ onComplete }: GeneratingRoadmapProps) {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % messages.length);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(msgInterval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 300);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const size = 160;
  const radius = (size - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  const MessageIcon = messages[currentMsg].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-12">
      <motion.div
        className="relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={8}
            stroke="#E8E8F0"
            fill="none"
          />
          <defs>
            <linearGradient id="genGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C5CE7" />
              <stop offset="100%" stopColor="#FF8C66" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={8}
            stroke="url(#genGrad)"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.3 }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={currentMsg}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
            transition={{ duration: 0.3 }}
          >
            <MessageIcon size={36} className="text-primary" />
          </motion.div>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={currentMsg}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="text-xl font-semibold text-text"
        >
          {messages[currentMsg].text}
        </motion.div>
        <p className="text-text-secondary text-sm">
          {Math.round(Math.min(progress, 100))}% complete
        </p>
      </div>

      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
