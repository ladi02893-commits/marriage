'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Award, Users, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="border-b border-border bg-brand-50/40 py-16 text-center dark:bg-brand-950/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">About TRUEPAIR</span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
            Where Compatibility Meets Commitment
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Founded with a vision to bring dignity, transparency, and computational precision to traditional matrimonial matchmaking for educated professionals worldwide.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Our Purpose</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
              Reinventing the Marriage Bureau for the Modern Era
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              In an age of fleeting swipe culture, TRUEPAIR was created specifically for individuals and families seeking genuine, lifelong commitment. We understand that marriage is a profound union of hearts, core moral values, intellect, and family traditions.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Our multi-criteria compatibility engine combines lifestyle, career goals, family values, and religious preferences to recommend candidates with deep mutual alignment.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border">
            <img
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800"
              alt="Matrimonial Union"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Pillars */}
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold text-foreground font-serif">Our Four Pillars of Matrimonial Trust</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              {
                icon: ShieldCheck,
                title: 'Rigorous Verification',
                desc: 'Every member must pass government ID and selfie biometric verification before earning the verified shield.',
              },
              {
                icon: Lock,
                title: 'Strict Privacy',
                desc: 'Granular photo and contact visibility controls ensure your sensitive information remains private.',
              },
              {
                icon: Sparkles,
                title: 'Algorithmic Synergy',
                desc: 'Weighted compatibility scoring accurately reflects the nuances of serious lifelong partnership.',
              },
              {
                icon: Users,
                title: 'Family Inclusivity',
                desc: 'Designed with family values at the center, facilitating respectful introductions between parents.',
              },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leadership */}
        <div className="rounded-3xl border border-brand-100 bg-brand-50/50 p-8 sm:p-12 text-center dark:border-brand-950 dark:bg-brand-950/20">
          <h2 className="text-2xl font-bold text-foreground font-serif mb-3">Global Matrimonial Offices</h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto mb-8">
            Headquartered in London with regional matchmaking consultation offices serving North America, the Middle East, and South Asia.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
              <h4 className="font-bold text-foreground mb-1">London Bureau (HQ)</h4>
              <p className="text-muted-foreground">42 Berkeley Square, Mayfair, London W1J 5AW</p>
            </div>
            <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
              <h4 className="font-bold text-foreground mb-1">New York Bureau</h4>
              <p className="text-muted-foreground">375 Park Avenue, Manhattan, NY 10152</p>
            </div>
            <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
              <h4 className="font-bold text-foreground mb-1">Dubai Bureau</h4>
              <p className="text-muted-foreground">DIFC Gate Precinct 4, Dubai, UAE</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
