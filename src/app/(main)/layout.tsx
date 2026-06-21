'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/navigation/BottomNav';
import { getState } from '@/lib/store';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = getState();
    if (!state.onboardingComplete) {
      router.replace('/');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <>
      <div className="flex-1 pb-24 overflow-y-auto">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
