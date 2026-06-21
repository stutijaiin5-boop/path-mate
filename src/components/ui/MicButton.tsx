'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface MicButtonProps {
  onResult?: (text: string) => void;
}

export default function MicButton({ onResult }: MicButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const toggleMic = () => {
    if (!hasSpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const results = event.results as SpeechRecognitionResultList;
      const transcript = results[0][0].transcript;
      onResult?.(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  if (!mounted || !hasSpeechRecognition) return null;

  return (
    <motion.button
      onClick={toggleMic}
      className={`p-3 rounded-full transition-colors ${
        isListening
          ? 'bg-primary text-white shadow-lg shadow-primary/30'
          : 'bg-surface text-text-secondary hover:text-primary'
      }`}
      whileTap={{ scale: 0.9 }}
      animate={isListening ? { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } } : {}}
    >
      {isListening ? <Mic size={20} /> : <MicOff size={20} />}
    </motion.button>
  );
}
