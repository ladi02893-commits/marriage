import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { CompatibilityBreakdown } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CompatibilityMeterProps {
  breakdown: CompatibilityBreakdown;
  className?: string;
}

export function CompatibilityMeter({ breakdown, className }: CompatibilityMeterProps) {
  const metrics = [
    { label: 'Age Range', score: breakdown.ageScore },
    { label: 'Location & Country', score: breakdown.locationScore },
    { label: 'Education Level', score: breakdown.educationScore },
    { label: 'Career Synergy', score: breakdown.professionScore },
    { label: 'Lifestyle & Diet', score: breakdown.lifestyleScore },
    { label: 'Family Values', score: breakdown.familyScore },
    { label: 'Religion & Cultural', score: breakdown.maritalScore },
  ];

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700 dark:bg-gold-950 dark:text-gold-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Compatibility Match Score</h4>
            <p className="text-xs text-muted-foreground">Weighted matrimonial partner algorithm</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-brand-600 font-serif">{breakdown.overallScore}%</span>
          <span className="text-xs font-semibold text-muted-foreground">MATCH</span>
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="space-y-3.5 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-semibold text-foreground">{m.score}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full transition-all duration-500 rounded-full',
                  m.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  m.score >= 60 ? 'bg-gradient-to-r from-amber-500 to-gold-500' :
                  'bg-rose-500'
                )}
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Key Match Highlights */}
      {breakdown.matchReasons?.length > 0 && (
        <div className="rounded-xl bg-brand-50/60 p-4 dark:bg-brand-950/30">
          <h5 className="text-xs font-bold text-brand-900 dark:text-brand-200 mb-2 uppercase tracking-wider">
            Why you two are compatible:
          </h5>
          <ul className="space-y-1.5 text-xs text-brand-800/90 dark:text-brand-300">
            {breakdown.matchReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
