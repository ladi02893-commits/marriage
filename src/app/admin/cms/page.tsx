'use client';

import React, { useState } from 'react';
import { FileText, Save, Plus, Trash2, Megaphone, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AdminCMSPage() {
  const { cms, updateCMS } = useAuth();
  const [bannerText, setBannerText] = useState(cms.announcementBanner.text);
  const [bannerEnabled, setBannerEnabled] = useState(cms.announcementBanner.enabled);
  const [stories, setStories] = useState(cms.successStories || []);
  const [faqs, setFaqs] = useState(cms.faqs || []);

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    updateCMS({
      announcementBanner: {
        enabled: bannerEnabled,
        text: bannerText,
      },
      faqs,
      successStories: stories,
    });
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [
      ...prev,
      {
        question: 'New Question?',
        answer: 'Provide clear, dignified explanation regarding VIP Royal Matchmaking policies.',
        category: 'General',
      },
    ]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddStory = () => {
    setStories((prev) => [
      ...prev,
      {
        id: `story-${Date.now()}`,
        coupleName: 'Hamza & Ayesha',
        weddingDate: 'August 2026',
        story: 'Connected through our dedicated family concierge service. Families met with dignity and shared values.',
        photoUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600',
        city: 'Lahore',
        isApproved: true,
      },
    ]);
  };

  const handleRemoveStory = (id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">CMS & Marketing Content</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage top announcement banners, royal success stories, and frequently asked questions.
          </p>
        </div>

        <button
          onClick={handleSaveCMS}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shadow-md hover:bg-amber-400 cursor-pointer"
        >
          <Save className="h-4 w-4" /> Publish CMS Updates
        </button>
      </div>

      {/* Top Banner Editor */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">Homepage Announcement Strip</h3>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={bannerEnabled}
              onChange={(e) => setBannerEnabled(e.target.checked)}
              className="rounded border-zinc-700 text-amber-500"
            />
            <span>Enable Banner</span>
          </label>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1">Banner Announcement Text</label>
          <input
            type="text"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* FAQs Manager */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white">Frequently Asked Questions ({faqs.length})</h3>
          <button
            type="button"
            onClick={handleAddFaq}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" /> Add FAQ
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[idx].question = e.target.value;
                    setFaqs(updated);
                  }}
                  placeholder="Question"
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs font-bold text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(idx)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                  title="Delete FAQ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[idx].answer = e.target.value;
                  setFaqs(updated);
                }}
                placeholder="Answer"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Royal Success Stories */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Royal Matrimonial Stories ({stories.length})</h3>
          </div>
          <button
            type="button"
            onClick={handleAddStory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" /> Add Story
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={story.coupleName}
                    onChange={(e) => {
                      const updated = stories.map((s) => (s.id === story.id ? { ...s, coupleName: e.target.value } : s));
                      setStories(updated);
                    }}
                    placeholder="Couple Names (e.g. Bilal & Fatima)"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs font-bold text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={story.weddingDate || ''}
                      onChange={(e) => {
                        const updated = stories.map((s) => (s.id === story.id ? { ...s, weddingDate: e.target.value } : s));
                        setStories(updated);
                      }}
                      placeholder="Wedding Date"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-[11px] text-zinc-300"
                    />
                    <input
                      type="text"
                      value={story.city || ''}
                      onChange={(e) => {
                        const updated = stories.map((s) => (s.id === story.id ? { ...s, city: e.target.value } : s));
                        setStories(updated);
                      }}
                      placeholder="City (e.g. Islamabad)"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-[11px] text-zinc-300"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStory(story.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                  title="Delete Story"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <textarea
                rows={2}
                value={story.story}
                onChange={(e) => {
                  const updated = stories.map((s) => (s.id === story.id ? { ...s, story: e.target.value } : s));
                  setStories(updated);
                }}
                placeholder="Story summary..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-400"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
