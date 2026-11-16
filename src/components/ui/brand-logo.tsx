'use client';

import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { useCustomization } from '@/lib/customization-context';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'navbar' | 'footer' | 'sidebar' | 'auth';
  customLogoUrl?: string;
  customWidth?: number;
  customHeight?: number;
  showText?: boolean;
  className?: string;
  companyNameOverride?: string;
  taglineOverride?: string;
}

export function BrandLogo({
  variant = 'navbar',
  customLogoUrl,
  customWidth,
  customHeight,
  showText,
  className,
  companyNameOverride,
  taglineOverride,
}: BrandLogoProps) {
  const { customization } = useCustomization();
  const [imageError, setImageError] = useState(false);

  const branding = customization.branding;
  const company = customization.company;

  const logoUrl =
    customLogoUrl !== undefined
      ? customLogoUrl
      : variant === 'footer' && branding.footerLogoUrl
      ? branding.footerLogoUrl
      : branding.primaryLogoUrl;

  const width =
    customWidth ||
    (variant === 'footer' && branding.footerLogoWidth
      ? branding.footerLogoWidth
      : branding.primaryLogoWidth) ||
    40;

  const height =
    customHeight ||
    (variant === 'footer' && branding.footerLogoHeight
      ? branding.footerLogoHeight
      : branding.primaryLogoHeight) ||
    40;

  const shouldShowText = showText !== undefined ? showText : branding.showTextWithLogo;
  const companyName = companyNameOverride || company.companyName || 'VIP ROYAL';
  const tagline = taglineOverride || company.tagline || 'Matchmaking Concierge';

  // Split company name if it contains space e.g. "VIP ROYAL"
  const nameParts = companyName.split(' ');
  const firstPart = nameParts[0] || 'VIP';
  const restPart = nameParts.slice(1).join(' ') || '';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {logoUrl && !imageError ? (
        <img
          src={logoUrl}
          alt={companyName}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            objectFit: 'contain',
          }}
          className="rounded-xl shrink-0 transition-transform group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-800 to-gold-600 shadow-md shadow-brand-900/20 text-white transition-transform group-hover:scale-105 border border-gold-400/30">
          <Crown className="h-5 w-5 text-gold-300" />
        </div>
      )}

      {shouldShowText && (
        <div className="min-w-0">
          <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-serif leading-none truncate">
            {firstPart}{' '}
            {restPart ? (
              <span className="text-brand-800 dark:text-gold-400 font-extrabold">{restPart}</span>
            ) : null}
          </div>
          {tagline ? (
            <div className="text-[8px] sm:text-[9px] tracking-[0.2em] text-gold-700 dark:text-gold-400 uppercase font-bold mt-0.5 truncate">
              {tagline}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
