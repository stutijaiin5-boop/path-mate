'use client';

import { motion } from 'framer-motion';
import ProgressRing from '@/components/ui/ProgressRing';

interface GoalProgressRingProps {
  progress: number;
  goal: string;
}

export default function GoalProgressRing({ progress, goal }: GoalProgressRingProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 py-6"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <ProgressRing progress={progress} size={140} strokeWidth={10}>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold gradient-text">{progress}%</span>
          <span className="text-xs text-text-secondary">complete</span>
        </div>
      </ProgressRing>
      <p className="text-sm text-text-secondary text-center max-w-[200px] leading-tight">
        toward <span className="font-semibold text-text">{goal}</span>
      </p>
    </motion.div>
  );
}
