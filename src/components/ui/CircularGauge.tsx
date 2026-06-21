'use client';

import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  label: string;
  sublabel?: string;
}

export default function CircularGauge({
  value,
  maxValue = 100,
  size = 140,
  label,
  sublabel,
}: CircularGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={10}
            stroke="#E8E8F0"
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={10}
            stroke="#4CD3A5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-text">{value}</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-text">{label}</span>
      {sublabel && (
        <span className="text-xs text-text-secondary">{sublabel}</span>
      )}
    </div>
  );
}
