'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Timeline from '@/components/roadmap/Timeline';
import { getState, getOverallProgress } from '@/lib/store';

export default function RoadmapPage() {
  const [, setRefresh] = useState(0);
  const state = getState();

  const handleToggle = useCallback(() => setRefresh(prev => prev + 1), []);

  if (!state.roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] px-8 gap-4">
        <MapPin size={48} className="text-text-secondary" />
        <p className="text-text-secondary text-center">Your roadmap will appear here once you set a goal.</p>
      </div>
    );
  }

  const progress = getOverallProgress(state);

  return (
    <motion.div
      className="flex flex-col py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 mb-2">
        <h1 className="text-2xl font-bold text-text">Your Roadmap</h1>
        <p className="text-sm text-text-secondary mt-1">
          {state.roadmap.totalDays} days • {progress}% complete
        </p>
      </div>

      <Timeline roadmap={state.roadmap} onToggle={handleToggle} />
    </motion.div>
  );
}
