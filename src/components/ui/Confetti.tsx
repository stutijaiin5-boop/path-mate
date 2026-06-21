'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const colors = ['#6C5CE7', '#FF8C66', '#4CD3A5', '#FFD93D', '#FF6B6B', '#A8E6CF'];

export default function Confetti({ active, duration = 2000 }: ConfettiProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; size: number; rotation: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: '-10px',
                width: p.size,
                height: p.size * 1.5,
                backgroundColor: p.color,
                borderRadius: '2px',
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{
                y: '100vh',
                rotate: p.rotation * 3,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration / 1000,
                ease: 'easeIn',
                delay: p.id * 0.02,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
