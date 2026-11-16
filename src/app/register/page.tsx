'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function SimpleRegisterPage() {
  const router = useRouter();
  const { sendSignupVerificationCode, completeSimpleRegistration } = useAuth();

  const [step, setStep] = useState<'DETAILS' | 'VERIFY'>('DETAILS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [verificationCode, setVerificationCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [devCodePreview, setDevCodePreview] = useState<string | undefined>(undefined);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Please enter your username, first name, last name, and email.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending 6-digit verification code to your email...');
    const res = await sendSignupVerificationCode({
      username: username.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    setIsSubmitting(false);
    toast.dismiss(toastId);

    if (!res.success || !res.verificationToken) {
      toast.error(res.error || 'Could not send verification code.');
      return;
    }

    setVerificationToken(res.verificationToken);
    setEmailSent(Boolean(res.emailSent));
    setDevCodePreview(res.devCodePreview);
    setStep('VERIFY');
    toast.success(
      res.emailSent
        ? `Verification code sent to ${email.trim().toLowerCase()}.`
        : 'Verification code generated! Enter the 6-digit code below.',
    );
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim().length < 6) {
      toast.error('Please enter the 6-digit email verification code.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Verifying code and creating your account...');
    const res = await completeSimpleRegistration({
      username: username.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      verificationCode: verificationCode.trim(),
      verificationToken,
    });
    setIsSubmitting(false);
    toast.dismiss(toastId);

    if (!res.success) {
      toast.error(res.error || 'Verification failed.');
      return;
    }

    toast.success('Email verified & account created! Please complete your profile and select your Marriage Bureau on the dashboard.');
    router.push(res.redirectUrl || '/dashboard/profile?onboarding=1');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-brand-50/25 via-background to-background dark:from-brand-950/15">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3.5 py-1 text-xs font-bold text-brand-700 dark:text-brand-300 border border-brand-200/50">
              <Crown className="h-3.5 w-3.5 text-gold-500" /> Quick & Verified Member Sign-Up
            </div>
            <h1 className="text-3xl font-bold font-serif text-foreground">
              {step === 'DETAILS' ? 'Create Your Account' : 'Verify Your Email'}
            </h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {step === 'DETAILS'
                ? 'Start with your username, name, and email. Complete your full profile and select your Marriage Bureau right inside your dashboard.'
                : `Enter the 6-digit verification code sent to ${email.trim().toLowerCase()} to complete sign-up.`}
            </p>
            <div className="pt-1">
              <Link
                href="/register/bureau"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/50 bg-gold-50/70 dark:bg-gold-950/30 px-4 py-1.5 text-xs font-bold text-gold-800 dark:text-gold-300 hover:bg-gold-100/80 transition"
              >
                <Building2 className="h-3.5 w-3.5 text-gold-600" />
                Own a Marriage Bureau (Daftar)? Register Bureau Office →
              </Link>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6">
            {/* Step indicator */}
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <div
                className={`rounded-xl px-3 py-2 flex items-center gap-2 border ${
                  step === 'DETAILS'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                {step === 'VERIFY' ? <CheckCircle2 className="h-4 w-4" /> : <span>1.</span>}
                <span>Account Info</span>
              </div>
              <div
                className={`rounded-xl px-3 py-2 flex items-center gap-2 border ${
                  step === 'VERIFY'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                    : 'border-border bg-muted/40 text-muted-foreground'
                }`}
              >
                <span>2.</span>
                <span>Email Code</span>
              </div>
            </div>

            {step === 'DETAILS' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Username *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={30}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. bilal_tariq"
                      className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Letters, numbers, dots, hyphens, or underscores (3–30 chars).</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Bilal"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Tariq"
                      className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Code...' : 'Send Email Verification Code'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                <div className="rounded-2xl border border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/30 p-4 text-xs space-y-2">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-brand-600" />
                    {emailSent ? 'Check your email inbox' : 'Email verification code'}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {emailSent
                      ? `We sent a 6-digit verification code to ${email.trim().toLowerCase()}.`
                      : `Email delivery is not configured in this environment. Use your verification code below for ${email.trim().toLowerCase()}:`}
                  </p>
                  {devCodePreview && (
                    <div className="rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-3 py-2 text-center font-mono text-base font-extrabold tracking-[0.3em] text-amber-900 dark:text-amber-200">
                      {devCodePreview}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">6-Digit Verification Code *</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter 6-digit code"
                      className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-3 text-sm font-mono tracking-[0.25em] text-foreground focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('DETAILS')}
                    className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change Details
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-brand-700 disabled:opacity-50"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {isSubmitting ? 'Verifying...' : 'Verify & Complete Sign-Up'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => void handleSendCode(e)}
                    className="text-[11px] font-semibold text-brand-600 hover:underline"
                  >
                    Didn&apos;t receive the code? Resend Verification Code
                  </button>
                </div>
              </form>
            )}

            <p className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-brand-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
