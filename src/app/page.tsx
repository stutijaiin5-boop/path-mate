'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import SituationCheck from '@/components/onboarding/SituationCheck';
import GeneratingRoadmap from '@/components/onboarding/GeneratingRoadmap';
import Confetti from '@/components/ui/Confetti';
import { updateState } from '@/lib/store';
import { generateRoadmap } from '@/lib/roadmap-generator';
import type { CurrentLevel, Commitment } from '@/lib/types';

type Step = 'welcome' | 'situation' | 'generating';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [userGoal, setUserGoal] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleWelcomeContinue = useCallback((goal: string) => {
    setUserGoal(goal);
    setStep('situation');
  }, []);

  const handleSituationComplete = useCallback((data: {
    currentLevel: CurrentLevel;
    hoursPerDay: number;
    deadline: string;
    commitments: Commitment[];
  }) => {
    setStep('generating');

    const roadmap = generateRoadmap(
      userGoal,
      data.currentLevel,
      data.hoursPerDay,
      data.deadline,
      data.commitments
    );

    updateState({
      goal: userGoal,
      currentLevel: data.currentLevel,
      hoursPerDay: data.hoursPerDay,
      deadline: data.deadline,
      commitments: data.commitments,
      roadmap,
    });
  }, [userGoal]);

  const handleGenerationComplete = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => {
      updateState({ onboardingComplete: true });
      setShowConfetti(false);
      router.push('/home');
    }, 1500);
  }, [router]);

  return (
    <div className="flex-1 flex flex-col bg-bg">
      <Confetti active={showConfetti} duration={2000} />
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <WelcomeScreen key="welcome" onContinue={handleWelcomeContinue} />
        )}
        {step === 'situation' && (
          <SituationCheck key="situation" onComplete={handleSituationComplete} />
        )}
        {step === 'generating' && (
          <GeneratingRoadmap key="generating" onComplete={handleGenerationComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}
