'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star, Quote, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/lib/auth-context';

export default function StoriesPage() {
  const { cms } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="border-b border-border bg-brand-50/40 py-16 text-center dark:bg-brand-950/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Celebrations of Love</span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
            TRUEPAIR Matrimonial Success Stories
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Real stories from doctors, engineers, executives, and accomplished couples who discovered their life partners on our platform.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 w-full space-y-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {cms.successStories.map((story) => (
            <div
              key={story.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-xl"
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted">
                <img src={story.photoUrl} alt={story.coupleName} className="h-full w-full object-cover" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white">
                  💍 Married {story.weddingDate}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-1 text-gold-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-500" />
                  ))}
                </div>
                <h3 className="text-xl font-bold text-foreground font-serif">{story.coupleName}</h3>
                <p className="text-xs text-muted-foreground mb-4 font-medium">{story.city}</p>
                <p className="text-xs leading-relaxed text-muted-foreground italic mb-6">"{story.story}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Your Story Box */}
        <div className="rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50 to-rose-50 p-8 sm:p-12 text-center dark:border-brand-900 dark:from-brand-950/40 dark:to-rose-950/20">
          <Heart className="h-8 w-8 text-brand-600 fill-brand-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-foreground font-serif">Did You Meet Your Spouse on TRUEPAIR?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            We would be honored to feature your love story and wedding photographs to inspire prospective members.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-brand-700"
          >
            Share Your Wedding Story <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
