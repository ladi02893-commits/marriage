'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface ReportModalProps {
  reportedUserId: string;
  reportedUserName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ reportedUserId, reportedUserName, isOpen, onClose }: ReportModalProps) {
  const { submitReport } = useAuth();
  const [category, setCategory] = useState<string>('FAKE_PROFILE');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the reason for your report.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitReport(reportedUserId, category, description);
      setIsSubmitting(false);
      toast.success('Report submitted. Our moderation team will investigate immediately.');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white p-6 shadow-2xl dark:bg-card">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Report {reportedUserName}</h3>
            <p className="text-xs text-muted-foreground">Confidential moderation review</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Violation Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
            >
              <option value="FAKE_PROFILE">Fake Profile or Stolen Photos</option>
              <option value="HARASSMENT">Harassment or Abusive Behavior</option>
              <option value="INAPPROPRIATE_CONTENT">Inappropriate / Vulgar Content</option>
              <option value="SCAM">Financial Scam / Commercial Solicitations</option>
              <option value="MISREPRESENTATION">Misrepresentation of Marital Status / Age</option>
              <option value="OTHER">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Details & Evidence</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details to assist our moderation team in auditing this profile..."
              className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
