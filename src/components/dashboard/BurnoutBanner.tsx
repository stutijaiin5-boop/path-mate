'use client';

import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface BurnoutBannerProps {
  consecutiveDays: number;
  onSuggestLighter: () => void;
  onDismiss: () => void;
}

export default function BurnoutBanner({
  consecutiveDays,
  onSuggestLighter,
  onDismiss,
}: BurnoutBannerProps) {
  return (
    <motion.div
      className="mx-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-400/10 border border-amber-400/20 shadow-card relative overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-full text-text-secondary/50 hover:text-text-secondary transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
          <Sparkles size={20} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text font-medium leading-relaxed">
            You&apos;ve been going hard for{' '}
            <span className="text-amber-400 font-bold">{consecutiveDays} days</span>{' '}
            straight. Want a lighter day today?
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={onSuggestLighter}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 transition-colors"
            >
              Suggest lighter tasks
            </button>
            <button
              onClick={onDismiss}
              className="py-2.5 px-4 rounded-xl bg-surface/50 text-text-secondary text-sm font-medium hover:bg-surface/80 transition-colors border border-border/50"
            >
              I&apos;m okay, dismiss
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-amber-400/5" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-rose-400/5" />
      </div>
    </motion.div>
  );
}
