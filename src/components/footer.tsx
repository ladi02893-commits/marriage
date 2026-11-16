'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  Music,
} from 'lucide-react';
import { useCustomization } from '@/lib/customization-context';
import { BrandLogo } from '@/components/ui/brand-logo';
import { SocialPlatform } from '@/lib/types';

function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case 'facebook':
      return <Facebook className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'twitter':
      return <Twitter className={className} />;
    case 'whatsapp':
      return <MessageCircle className={className} />;
    case 'tiktok':
      return <Music className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export function Footer() {
  const { customization } = useCustomization();
  const { company, columns, socialLinks, copyright, design } = customization;

  const currentYear = copyright.useDynamicYear
    ? new Date().getFullYear()
    : copyright.customYear || new Date().getFullYear();

  const enabledColumns = columns
    .filter((col) => col.enabled)
    .sort((a, b) => a.order - b.order);

  const enabledSocials = socialLinks
    .filter((soc) => soc.enabled && soc.url.trim().length > 0)
    .sort((a, b) => a.order - b.order);

  const paddingClass =
    design.paddingY === 'compact'
      ? 'py-8'
      : design.paddingY === 'spacious'
      ? 'py-16'
      : 'py-12';

  const fontSizeClass =
    design.fontSize === 'sm'
      ? 'text-sm'
      : design.fontSize === 'base'
      ? 'text-base'
      : 'text-xs';

  return (
    <footer
      style={{
        backgroundColor: design.backgroundColor || '#ffffff',
        color: design.textColor || '#71717a',
        borderColor: design.borderColor || '#e4e4e7',
      }}
      className="border-t transition-colors duration-200"
    >
      {/* Trust Highlights Strip */}
      <div className="border-b border-border/80 bg-brand-50/40 py-8 dark:bg-brand-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-gold-300 shadow-sm">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Family Consultants</h4>
                <p className="text-xs text-muted-foreground">Dedicated senior matchmaker concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300">
                <ShieldCheck className="h-5 w-5 text-gold-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Verified Profiles</h4>
                <p className="text-xs text-muted-foreground">Manual ID & WhatsApp authentication</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-100 text-navy-800 dark:bg-navy-950 dark:text-navy-300">
                <Lock className="h-5 w-5 text-navy-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Private & Controlled</h4>
                <p className="text-xs text-muted-foreground">Contact revealed only with consent</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Connection Credits</h4>
                <p className="text-xs text-muted-foreground">Fixed credits with no monthly expiry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className={`mx-auto max-w-7xl px-4 ${paddingClass} sm:px-6 lg:px-8`}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Company Details Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <BrandLogo variant="footer" />
            </Link>

            <p
              style={{ color: design.textColor }}
              className={`${fontSizeClass} leading-relaxed max-w-sm`}
            >
              {company.footerDescription || company.shortDescription}
            </p>

            {/* Address & Contact Information */}
            <div className={`space-y-2 ${fontSizeClass} pt-1`}>
              {company.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0 mt-0.5" />
                  <span>{company.address}</span>
                </div>
              )}
              {company.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                  <a
                    href={`tel:${company.contactPhone}`}
                    className="hover:underline transition"
                  >
                    {company.contactPhone}
                  </a>
                </div>
              )}
              {company.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gold-600 shrink-0" />
                  <a
                    href={`mailto:${company.contactEmail}`}
                    className="hover:underline transition"
                  >
                    {company.contactEmail}
                  </a>
                </div>
              )}
              {company.whatsappNumber && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <a
                    href={`https://wa.me/${company.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition text-emerald-600 font-semibold"
                  >
                    WhatsApp: {company.whatsappNumber}
                  </a>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {enabledSocials.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Connect With Us
                </div>
                <div className="flex items-center gap-2.5">
                  {enabledSocials.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={soc.label}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-background/80 hover:bg-gold-50 dark:hover:bg-gold-950/40 text-muted-foreground hover:text-gold-600 transition shadow-sm"
                    >
                      <SocialIcon platform={soc.platform} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Navigation Columns */}
          {enabledColumns.map((col) => {
            const enabledLinks = (col.links || [])
              .filter((l) => l.enabled)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={col.id} className="space-y-3">
                <h4
                  style={{ color: design.headingColor || '#18181b' }}
                  className="text-xs font-bold uppercase tracking-wider font-mono"
                >
                  {col.title}
                </h4>
                <ul className={`space-y-2 ${fontSizeClass}`}>
                  {enabledLinks.map((link) => {
                    const isExternal = link.url.startsWith('http');
                    return (
                      <li key={link.id}>
                        {isExternal ? (
                          <a
                            href={link.url}
                            target={link.openInNewTab ? '_blank' : undefined}
                            rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                            style={{ color: design.linkColor || '#71717a' }}
                            className="transition hover:underline"
                          >
                            {link.title}
                          </a>
                        ) : (
                          <Link
                            href={link.url}
                            style={{ color: design.linkColor || '#71717a' }}
                            className="transition hover:underline"
                          >
                            {link.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div
          style={{ borderColor: design.borderColor || '#e4e4e7' }}
          className="mt-12 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground"
        >
          <p>
            © {currentYear} {copyright.companyName}. {copyright.copyrightText}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            {copyright.additionalText ? (
              <span>{copyright.additionalText}</span>
            ) : (
              <>
                <span>Consent-based introductions</span>
                <span>•</span>
                <span>No Monthly Expiry on Connections</span>
                <span>•</span>
                <span>Strict Family Confidentiality</span>
              </>
            )}
            {copyright.legalInfo && (
              <>
                <span>•</span>
                <span>{copyright.legalInfo}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
