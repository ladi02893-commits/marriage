'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Camera,
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function VerificationHubPage() {
  const { currentUser, verifications, submitVerification } = useAuth();
  const [docType, setDocType] = useState<'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID'>('PASSPORT');
  const [docUrl, setDocUrl] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400');
  const [selfieUrl, setSelfieUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userVerif = verifications.find((v) => v.userId === currentUser?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl || !selfieUrl) {
      toast.error('Please provide both document and live selfie images.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitVerification(docType, docUrl, selfieUrl);
      setIsSubmitting(false);
      toast.success('Verification dossier submitted for compliance review.');
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Identity Verification Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Earn the Blue Shield badge to increase profile trust and unlock verified contact viewing.
          </p>
        </div>

        {currentUser?.isVerified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" /> VERIFIED MEMBER
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-4 w-4" /> Verification Pending
          </span>
        )}
      </div>

      {/* Verification Status Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Current Verification Status</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentUser?.isVerified
                ? 'Your government identity document and facial biometric selfie have been verified by TRUEPAIR compliance officers. The Blue Shield badge is prominently displayed on your profile card.'
                : userVerif
                ? `Verification request (${userVerif.documentType}) is currently ${userVerif.status.toLowerCase()}. Our compliance team will audit it shortly.`
                : 'You have not yet submitted your government ID. Submit below to gain the verified badge.'}
            </p>
          </div>
        </div>
      </div>

      {/* Submit Verification Form */}
      {!currentUser?.isVerified && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold font-serif text-foreground mb-1">
            Submit Government ID for Audit
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            All files are encrypted with AES-256 and never shared with other users.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'PASSPORT', label: 'International Passport' },
                { id: 'DRIVING_LICENSE', label: "Driver's License" },
                { id: 'NATIONAL_ID', label: 'National Identity Card' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDocType(t.id as any)}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-center transition ${
                    docType === t.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Document File Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Document Front Image
                </label>
                <FileUpload
                  label="Upload ID Document"
                  bucket="verifications"
                  folder="documents"
                  value={docUrl}
                  onUploadSuccess={(url) => setDocUrl(url)}
                />
              </div>

              {/* Live Selfie Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Live Biometric Selfie
                </label>
                <FileUpload
                  label="Upload Selfie"
                  bucket="verifications"
                  folder="selfies"
                  value={selfieUrl}
                  onUploadSuccess={(url) => setSelfieUrl(url)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-600" /> End-to-end encrypted storage
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:from-brand-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
