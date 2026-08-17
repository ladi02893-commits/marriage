'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeUrlRef = useRef<string>('');

  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsVisible(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + Math.random() * 15 + 5;
        if (prev < 85) return prev + Math.random() * 5 + 1;
        if (prev < 95) return prev + 0.5;
        return prev;
      });
    }, 150);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 250);
  };

  // Route change completed
  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams.toString()}`;
    if (activeUrlRef.current && activeUrlRef.current !== currentUrl) {
      completeProgress();
    }
    activeUrlRef.current = currentUrl;
  }, [pathname, searchParams]);

  // Global click interceptor for instant feedback on all link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isInternal =
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/#') &&
        !target.getAttribute('target') &&
        !target.getAttribute('download') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey;

      if (isInternal && href !== pathname) {
        startProgress();
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => {
      document.removeEventListener('click', handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-1 overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms ease-out',
      }}
    >
      {/* Glow Bar */}
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 200ms ease-out' : 'width 300ms cubic-bezier(0.1, 0.5, 0.1, 1)',
        }}
      />
      {/* Head sparkle */}
      {isVisible && progress < 100 && (
        <div
          className="absolute top-0 right-0 h-1 w-20 bg-white/60 blur-xs"
          style={{
            transform: `translateX(${progress - 100}%)`,
          }}
        />
      )}
    </div>
  );
}
