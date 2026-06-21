'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Map, CheckSquare, BarChart3, User } from 'lucide-react';

const tabs = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeIndex = tabs.findIndex(t => pathname === t.path);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <nav className="glass rounded-2xl px-2 py-2 shadow-lg border border-border/50 flex items-center gap-1">
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <Icon
                size={20}
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-secondary'
                }`}
              />
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                  layoutId="activeDot"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
