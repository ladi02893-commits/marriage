'use client';

import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Pulsing Aura Rings */}
        <div className="absolute h-24 w-24 rounded-full bg-brand-500/10 animate-ping" />
        <div className="absolute h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-rose-500/20 blur-md animate-pulse" />

        {/* Center Spinner Ring */}
        <div className="relative h-16 w-16 rounded-full border-2 border-brand-200/50 dark:border-brand-950/80 flex items-center justify-center shadow-lg bg-card">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-600 border-r-amber-500 animate-spin" />
          <Heart className="h-6 w-6 text-brand-600 animate-pulse fill-brand-600/20" />
        </div>
      </div>

      {/* Brand Slogan */}
      <div className="mt-6 text-center space-y-2 max-w-xs">
        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
          <span>Compatible Matrimonials</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Connecting verified matrimonial profiles...
        </p>

        {/* Shimmer loading bar */}
        <div className="w-36 h-1 mx-auto bg-muted rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
}
