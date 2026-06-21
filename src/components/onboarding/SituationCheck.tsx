'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CurrentLevel, Commitment } from '@/lib/types';

interface SituationCheckProps {
  onComplete: (data: {
    currentLevel: CurrentLevel;
    hoursPerDay: number;
    deadline: string;
    commitments: Commitment[];
  }) => void;
}

const commitmentOptions: { value: Commitment; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'college', label: 'College' },
  { value: 'job', label: 'Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'coaching', label: 'Coaching classes' },
  { value: 'family', label: 'Family responsibilities' },
];

const levels: { value: CurrentLevel; label: string; emoji: string }[] = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '🌿' },
  { value: 'almost-there', label: 'Almost there', emoji: '🌳' },
];

const slides = ['level', 'hours', 'deadline', 'commitments'] as const;

export default function SituationCheck({ onComplete }: SituationCheckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>('beginner');
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [deadline, setDeadline] = useState('');
  const [commitments, setCommitments] = useState<Commitment[]>([]);

  const slideType = slides[currentSlide];

  const canProceed = () => {
    switch (slideType) {
      case 'level': return true;
      case 'hours': return true;
      case 'deadline': return deadline !== '';
      case 'commitments': return true;
      default: return false;
    }
  };

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete({ currentLevel, hoursPerDay, deadline, commitments });
    }
  };

  const prev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const toggleCommitment = (c: Commitment) => {
    setCommitments(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="flex flex-col min-h-dvh px-6 py-12 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prev}
          className={`p-2 rounded-full transition-colors ${currentSlide === 0 ? 'invisible' : 'hover:bg-border text-text'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-8 bg-primary'
                  : i < currentSlide
                  ? 'w-2 bg-success'
                  : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slideType}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute inset-0"
          >
            {slideType === 'level' && (
              <div className="flex flex-col gap-8 py-4">
                <div>
                  <h2 className="text-2xl font-bold text-text mb-2">What&apos;s your current level?</h2>
                  <p className="text-text-secondary">This helps me tailor the difficulty for you</p>
                </div>

                <div className="flex flex-col gap-4">
                  {levels.map(l => (
                    <motion.button
                      key={l.value}
                      onClick={() => setCurrentLevel(l.value)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                        currentLevel === l.value
                          ? 'border-primary bg-primary/5 shadow-card'
                          : 'border-border bg-surface hover:border-primary/30'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-3xl">{l.emoji}</span>
                      <span className={`text-lg font-semibold ${
                        currentLevel === l.value ? 'text-primary' : 'text-text'
                      }`}>
                        {l.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {slideType === 'hours' && (
              <div className="flex flex-col gap-8 py-4">
                <div>
                  <h2 className="text-2xl font-bold text-text mb-2">How many hours/day can you give?</h2>
                  <p className="text-text-secondary">Be honest - consistency matters more than hours</p>
                </div>

                <div className="flex flex-col items-center gap-8 py-8">
                  <motion.div
                    className="text-7xl font-bold gradient-text"
                    key={hoursPerDay}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    {hoursPerDay}h
                  </motion.div>

                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={hoursPerDay}
                    onChange={e => setHoursPerDay(Number(e.target.value))}
                    className="w-full max-w-xs"
                  />

                  <div className="flex justify-between w-full max-w-xs text-sm text-text-secondary">
                    <span>1h</span>
                    <span>5h</span>
                    <span>10h</span>
                  </div>
                </div>
              </div>
            )}

            {slideType === 'deadline' && (
              <div className="flex flex-col gap-8 py-4">
                <div>
                  <h2 className="text-2xl font-bold text-text mb-2">Target deadline?</h2>
                  <p className="text-text-secondary">When do you want to achieve your goal by?</p>
                </div>

                <div className="flex flex-col items-center gap-6 py-8">
                  <div className="relative w-full max-w-xs">
                    <input
                      type="date"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                      min={minDate}
                      className="w-full p-4 rounded-2xl border-2 border-border bg-surface text-text text-lg font-semibold appearance-none outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {deadline && (
                    <motion.p
                      className="text-text-secondary text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {Math.ceil(
                        (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )}{' '}
                      days from now
                    </motion.p>
                  )}
                </div>
              </div>
            )}

            {slideType === 'commitments' && (
              <div className="flex flex-col gap-8 py-4">
                <div>
                  <h2 className="text-2xl font-bold text-text mb-2">Any current commitments?</h2>
                  <p className="text-text-secondary">Select all that apply (optional)</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {commitmentOptions.map(c => (
                    <motion.button
                      key={c.value}
                      onClick={() => toggleCommitment(c.value)}
                      className={`px-5 py-3 rounded-full border-2 transition-all text-sm font-medium ${
                        commitments.includes(c.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface text-text-secondary hover:border-primary/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {c.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center pt-4">
        <motion.button
          className="w-full max-w-sm py-4 rounded-2xl bg-primary text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-40 disabled:shadow-none"
          onClick={next}
          disabled={!canProceed()}
          whileHover={canProceed() ? { scale: 1.02 } : {}}
          whileTap={canProceed() ? { scale: 0.98 } : {}}
        >
          {currentSlide === slides.length - 1 ? 'Generate My Roadmap' : 'Next'}
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  );
}
