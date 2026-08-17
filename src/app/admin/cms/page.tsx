'use client';

import React, { useState } from 'react';
import { FileText, Save, Plus, Trash2, Megaphone, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AdminCMSPage() {
  const { cms } = useAuth();
  const [bannerText, setBannerText] = useState(cms.announcementBanner.text);
  const [bannerEnabled, setBannerEnabled] = useState(cms.announcementBanner.enabled);
  const [stories, setStories] = useState(cms.successStories);
  const [faqs, setFaqs] = useState(cms.faqs);

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Website CMS content updated successfully!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">CMS & Marketing Content</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage top announcement banners, success stories, and frequently asked questions.
          </p>
        </div>

        <button
          onClick={handleSaveCMS}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shadow-md hover:bg-amber-400"
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
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <input
                type="text"
                value={faq.question}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[idx].question = e.target.value;
                  setFaqs(updated);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs font-bold text-white"
              />
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[idx].answer = e.target.value;
                  setFaqs(updated);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-400"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
